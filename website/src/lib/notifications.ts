// Push notification service using Expo Push API

import { connectDB } from "./db/mongodb"
import { PushToken } from "./db/models/PushToken"

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send"

export interface ExpoPushMessage {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, unknown>
  priority?: "default" | "normal" | "high"
  ttl?: number
}

export interface ExpoPushResponse {
  data?: { id: string; status: string }[]
  errors?: { message: string; details?: Record<string, unknown> }[]
}

export async function sendExpoPushNotification(message: ExpoPushMessage): Promise<ExpoPushResponse> {
  try {
    const response = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([message]), // Expo expects an array
    })

    return await response.json()
  } catch (error) {
    console.error("Failed to send push notification:", error)
    return { errors: [{ message: "Failed to send notification" }] }
  }
}

export async function sendOrderNotification(
  orderId: string,
  orderNumber: string
): Promise<{ sent: number; errors: number }> {
  console.log("[PUSH] sendOrderNotification called:", { orderId, orderNumber })
  await connectDB()

  const tokens = await PushToken.find({})
  console.log("[PUSH] Found tokens:", tokens.length)

  if (tokens.length === 0) {
    console.log("[PUSH] No tokens found in DB")
    return { sent: 0, errors: 0 }
  }

  console.log("[PUSH] Tokens:", tokens.map(t => ({ email: t.email, token: t.pushToken })))

  const results = await Promise.all(
    tokens.map((token) =>
      sendExpoPushNotification({
        to: token.pushToken,
        title: "New Order",
        body: `Order #${orderNumber.slice(-8)}`,
        data: {
          type: "new_order",
          orderId,
          orderNumber,
        },
        priority: "high",
        ttl: 86400,
      })
    )
  )
  console.log("[PUSH] Expo response:", JSON.stringify(results))

  const errorCount = results.filter((r) => r.errors && r.errors.length > 0).length

  return { sent: tokens.length - errorCount, errors: errorCount }
}