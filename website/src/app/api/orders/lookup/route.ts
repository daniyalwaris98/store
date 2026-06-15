import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Order } from "@/lib/db/models/Order"
import { Customer } from "@/lib/db/models/Customer"
import { z } from "zod"
import { connectDB } from "@/lib/db/mongodb"

const lookupSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Enter a valid email address"),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const validation = lookupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { orderNumber, email } = validation.data

    // Find customer by email
    const customer = await Customer.findOne({ email })
    if (!customer) {
      // Don't reveal whether order exists - return generic not found
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Find order by orderNumber AND customer._id
    const order = await Order.findOne({
      orderNumber,
      customer: customer._id,
    }).populate("customer", "name email phone addresses")

    if (!order) {
      // Don't reveal whether order exists vs email mismatch - security
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("POST /api/orders/lookup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}