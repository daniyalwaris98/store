import { NextRequest, NextResponse } from "next/server"
import { sendOrderNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber } = body

    if (!orderId || !orderNumber) {
      return NextResponse.json({ error: "orderId and orderNumber are required" }, { status: 400 })
    }

    const result = await sendOrderNotification(orderId, orderNumber)

    return NextResponse.json({
      success: result.errors === 0,
      sent: result.sent,
      failed: result.errors,
    })
  } catch (error) {
    console.error("Send notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}