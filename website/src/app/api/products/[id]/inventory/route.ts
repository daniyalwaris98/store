import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Product } from "@/lib/db/models/Product"
import { updateInventorySchema } from "@/lib/validators/product"
import { getSession } from "@/lib/auth/session"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const validation = updateInventorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { inventory: validation.data.inventory },
      { new: true }
    )

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("PATCH /api/products/[id]/inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
