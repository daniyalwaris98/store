import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { Collection } from "@/lib/db/models/Collection"
import { createCollectionSchema } from "@/lib/validators/collection"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import { invalidateCollectionsCache } from "@/lib/cache/invalidation"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession()
    const isAdmin = !!session.isAdmin

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const filter: Record<string, unknown> = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ]
    }

    if (isAdmin) {
      const collections = await Collection.find(filter).sort({ order: 1, name: 1 })
      return NextResponse.json(collections)
    }

    const collections = await Collection.find({ status: "active", ...filter })
      .sort({ order: 1, name: 1 })

    return NextResponse.json(collections)
  } catch (error) {
    console.error("GET /api/collections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validation = createCollectionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, ...rest } = validation.data

    // Check if slug already exists
    const slug = slugify(name)
    const existing = await Collection.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: "Collection with this name already exists" }, { status: 400 })
    }

    const collection = await Collection.create({
      name,
      slug,
      ...rest,
    })

    await invalidateCollectionsCache()
    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("POST /api/collections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
