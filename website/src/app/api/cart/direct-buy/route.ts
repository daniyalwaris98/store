import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Product } from "@/lib/db/models/Product"
import { directBuySchema } from "@/lib/validators/cart"
import { resolveProductPrice } from "@/lib/currency"
import { DEFAULT_CURRENCY } from "@/lib/currency"
import { connectDB } from "@/lib/db/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = directBuySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { productId, variantId, quantity, currency = DEFAULT_CURRENCY } = validation.data

    await connectDB()

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const variant = variantId
      ? product.variants?.find((v: { _id: string }) => v._id.toString() === variantId)
      : null

    const productPrice = resolveProductPrice(
      { salePrice: product.salePrice, originalPrice: product.originalPrice, currency: product.currency || "USD", prices: product.prices },
      currency
    )

    let price = productPrice.salePrice
    if (variant) {
      const variantPrice = resolveProductPrice(
        { salePrice: variant.price || 0, currency: product.currency || "USD", prices: variant.prices },
        currency
      )
      price = variantPrice.salePrice
    }

    // Create a minimal cart item for direct checkout redirect
    const cartItem = {
      productId,
      variantId,
      variantOptions: variant?.options || undefined,
      quantity,
      name: product.name,
      price,
      image: product.gallery?.[0]?.url || null,
      sku: variant?.sku || product.sku,
    }

    // Store in session for checkout retrieval
    // Client should redirect to checkout with this item
    return NextResponse.json({
      success: true,
      redirectTo: "/checkout",
      item: cartItem,
    })
  } catch (error) {
    console.error("POST /api/cart/direct-buy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
