import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Order } from "@/lib/db/models/Order"
import "@/lib/db/models/Customer"
import "@/lib/db/models/Product"
import { updateOrderStageSchema } from "@/lib/validators/order"
import { getServerSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Try to find by orderNumber first, then by MongoDB _id
    let order = await Order.findOne({ orderNumber: id })
      .populate("customer", "name email phone addresses")
      .populate("items.product", "name gallery")

    if (!order) {
      order = await Order.findById(id)
        .populate("customer", "name email phone addresses")
        .populate("items.product", "name gallery")
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await Order.deleteOne({ _id: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const validation = updateOrderStageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { stage, note } = validation.data

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update stage and add to history
    order.stage = stage
    order.stageHistory.push({
      stage,
      note,
      timestamp: new Date(),
    })

    // Update fulfillment status based on stage
    if (stage === "delivered") {
      order.fulfillmentStatus = "fulfilled"
      order.paymentStatus = "paid"
    }

    await order.save()

    return NextResponse.json(order)
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
