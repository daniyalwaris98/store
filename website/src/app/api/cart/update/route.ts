import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { updateCartItemSchema } from "@/lib/validators/cart"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = updateCartItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { itemId, quantity } = validation.data

    if (quantity <= 0) {
      return NextResponse.json({ success: true, removed: true })
    }

    // Cart is managed client-side via CartContext
    // This endpoint can be used for server-side cart persistence if needed
    return NextResponse.json({
      success: true,
      itemId,
      quantity,
    })
  } catch (error) {
    console.error("PATCH /api/cart/update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}