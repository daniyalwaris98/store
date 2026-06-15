import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { Order } from "@/lib/db/models/Order"
import { Customer } from "@/lib/db/models/Customer"
import { ShippingZone } from "@/lib/db/models/ShippingZone"
import { createOrderSchema, orderQuerySchema } from "@/lib/validators/order"
import { getServerSession } from "@/lib/auth/session"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendOrderNotification } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const rawQuery = {
      status: searchParams.get("status") || undefined,
      stage: searchParams.get("stage") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      search: searchParams.get("search") || undefined,
      customerEmail: searchParams.get("customerEmail") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    }
    const query = orderQuerySchema.parse(rawQuery)

    const { stage, status, dateFrom, dateTo, search, customerEmail, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    // Build filter
    const filter: Record<string, unknown> = {}
    if (stage) filter.stage = stage
    if (status) filter.paymentStatus = status
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {}
      if (dateFrom) dateFilter.$gte = new Date(dateFrom)
      if (dateTo) dateFilter.$lte = new Date(dateTo)
      filter.createdAt = dateFilter
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
      ]
    }
    if (customerEmail) {
      // Look up customer by email to get their ID, then filter by customer ID
      const targetCustomer = await Customer.findOne({ email: customerEmail })
      if (targetCustomer) {
        filter.customer = targetCustomer._id
      } else {
        // No customer found with this email, return empty
        return NextResponse.json({ orders: [], pagination: { page, limit, total: 0, pages: 0 } })
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email")
        .populate("items.product", "name gallery")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { items, customerInfo, shippingAddress, shippingMethodId, paymentMethod, currency } = validation.data
    await connectDB()

    // Find or create customer
    let customer = await Customer.findOne({ email: customerInfo.email })
    if (!customer) {
      customer = await Customer.create({
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone,
        addresses: [shippingAddress],
      })
    } else {
      // Update customer info and add address if new
      customer.name = customerInfo.name || customer.name
      customer.phone = customerInfo.phone || customer.phone
      const addressExists = customer.addresses.some(
        (addr: { street: string }) => addr.street === shippingAddress.street
      )
      if (!addressExists) {
        customer.addresses.push(shippingAddress)
      }
      await customer.save()
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Look up shipping zone to get real shipping cost
    const zone = await ShippingZone.findOne({
      countries: shippingAddress.country,
      status: "active",
    })
    let shippingCost = 0
    if (zone) {
      const rate = zone.rates.find((r: { name: string }) => r.name === shippingMethodId)
      if (rate) {
        shippingCost = rate.price + zone.handlingFee
      }
    }

    const total = subtotal + shippingCost

    // Generate order number — UUID-based to avoid race conditions
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    const orderNumber = `ORD-${timestamp}-${randomSuffix}`

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      items,
      subtotal,
      shippingCost,
      total,
      currency: validation.data.currency,
      country: shippingAddress.country,
      shippingAddress,
      stage: "unpaid",
      paymentMethod,
      paymentStatus: "unpaid",
      fulfillmentStatus: "unfulfilled",
      stageHistory: [{ stage: "unpaid", timestamp: new Date() }],
    })

    // Fire order confirmation email (non-blocking)
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerEmail: customer.email,
      customerName: customer.name,
      items: order.items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
    }).catch((err) => {
      console.error("Failed to send order confirmation email:", err)
    })

    // Send push notification to admin (non-blocking)
    console.log("[ORDER] About to send push notification for:", order.orderNumber)
    sendOrderNotification(order._id.toString(), order.orderNumber).catch((err) => {
      console.error("[ORDER] Failed to send push notification:", err)
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
