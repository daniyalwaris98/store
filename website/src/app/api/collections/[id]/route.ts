import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import "@/lib/db/mongodb"
import { Collection } from "@/lib/db/models/Collection"
import { Product } from "@/lib/db/models/Product"
import { updateCollectionSchema } from "@/lib/validators/collection"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import { DeleteImage } from "@/app/api/uploads/[publicId]/route"
import { invalidateCollectionsCache } from "@/lib/cache/invalidation"
import { connectDB } from "@/lib/db/mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get("include") === "products"

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
    const collection = await Collection.findOne(query)

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    await connectDB()

    const result: Record<string, unknown> = {
      _id: collection._id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      parent: collection.parent,
      order: collection.order,
      image: collection.image,
      filters: collection.filters,
      status: collection.status,
      showInMenu: collection.showInMenu,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }

    if (includeProducts) {
      // Get all child collection IDs to include their products too
      const childCollections = await Collection.find(
        { parent: collection._id, status: "active" },
        "_id"
      ).lean()
      const allCollectionIds = [collection._id, ...childCollections.map((c) => c._id)]

      const products = await Product.find({
        collections: { $in: allCollectionIds },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .select("_id name slug salePrice originalPrice currency gallery stickerId")
        .lean()
      result.products = products.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        salePrice: p.salePrice,
        originalPrice: p.originalPrice,
        currency: p.currency,
        gallery: p.gallery,
        stickerId: p.stickerId,
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/collections/[id] error:", error)
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
    const validation = updateCollectionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // If name is being updated, regenerate slug
    const updatePayload: Record<string, unknown> = { ...updateData }
    if (updateData.name) {
      const slug = slugify(updateData.name)
      const slugExisting = await Collection.findOne({ slug, _id: { $ne: id } })
      if (slugExisting) {
        return NextResponse.json({ error: "Collection with this name already exists" }, { status: 400 })
      }
      updatePayload.slug = slug
    }

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }

    const collection = await Collection.findOneAndUpdate(query, updatePayload, { new: true })
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    await invalidateCollectionsCache()
    return NextResponse.json(collection)
  } catch (error) {
    console.error("PUT /api/collections/[id] error:", error)
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
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }

    const collection = await Collection.findOneAndDelete(query)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    await invalidateCollectionsCache()

    if (collection.image) {
      try {
        await DeleteImage(collection.image)
      } catch (err) {
        console.error("[DELETE collection] Failed to delete asset:", err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/collections/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}