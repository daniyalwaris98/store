import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Product } from "@/lib/db/models/Product"
import { addToCartSchema } from "@/lib/validators/cart"
import { resolveProductPrice } from "@/lib/currency"
import { DEFAULT_CURRENCY } from "@/lib/currency"
import { connectDB } from "@/lib/db/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = addToCartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { productId, variantId, quantity, currency = DEFAULT_CURRENCY } = validation.data

    await connectDB()

    // Get product to validate it exists
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

    return NextResponse.json({
      success: true,
      item: {
        productId,
        variantId,
        variantOptions: variant?.options || undefined,
        quantity,
        name: product.name,
        price,
        image: product.gallery?.[0] || null,
        sku: variant?.sku || product.sku,
      },
    })
  } catch (error) {
    console.error("POST /api/cart/add error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
