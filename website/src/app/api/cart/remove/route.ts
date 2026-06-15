import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { removeFromCartSchema } from "@/lib/validators/cart"

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = removeFromCartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { itemId } = validation.data

    // Cart is managed client-side via CartContext
    return NextResponse.json({
      success: true,
      itemId,
    })
  } catch (error) {
    console.error("DELETE /api/cart/remove error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}