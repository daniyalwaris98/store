import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import "@/lib/db/mongodb"
import { Product } from "@/lib/db/models/Product"
import "@/lib/db/models/SizeChart"
import { updateProductSchema, updateInventorySchema } from "@/lib/validators/product"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import { DeleteImage } from "@/app/api/uploads/[publicId]/route"
import { connectDB } from "@/lib/db/mongodb"
import { invalidateProductsCache } from "@/lib/cache/invalidation"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
    const product = await Product.findOne(query).populate("sizeChartId")
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    await connectDB()

    // If name is being updated, regenerate slug
    const updatePayload: Record<string, unknown> = { ...updateData }
    if (updateData.name) {
      const slug = slugify(updateData.name)
      const slugExisting = await Product.findOne({ slug, _id: { $ne: id } })
      if (slugExisting) {
        return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 })
      }
      updatePayload.slug = slug
    }

    const product = await Product.findByIdAndUpdate(id, updatePayload, { new: true })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await invalidateProductsCache()

    return NextResponse.json(product)
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.gallery?.length) {
      for (const item of product.gallery) {
        try {
          await DeleteImage(item.url)
        } catch (err) {
          console.error("Failed to delete asset:", err)
        }
      }
    }

    await invalidateProductsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
