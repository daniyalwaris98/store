import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import "@/lib/db/mongodb"
import { Collection } from "@/lib/db/models/Collection"
import { Product } from "@/lib/db/models/Product"
import { connectDB } from "@/lib/db/mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params

    // Support both slug and MongoDB ObjectId
    const query = mongoose.isValidObjectId(slug)
      ? { _id: slug, status: "active" }
      : { slug, status: "active" }

    const collection = await Collection.findOne(query)

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

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
      .limit(6)
      .select("_id name slug salePrice originalPrice currency gallery stickerId")
      .lean()

    return NextResponse.json({
      _id: collection._id.toString(),
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image,
      products: products.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        salePrice: p.salePrice,
        originalPrice: p.originalPrice,
        currency: p.currency,
        gallery: p.gallery,
        stickerId: p.stickerId,
      })),
    })
  } catch (error) {
    console.error("GET /api/collections/public/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}