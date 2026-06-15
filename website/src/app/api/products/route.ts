import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { Product } from "@/lib/db/models/Product"
import { productQuerySchema, createProductSchema } from "@/lib/validators/product"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import { invalidateProductsCache } from "@/lib/cache/invalidation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await connectDB()

    const rawQuery = {
      collection: searchParams.get("collection") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      status: searchParams.get("status") || undefined,
    }
    const query = productQuerySchema.parse(rawQuery)

    const { collection, search, page, limit, sort, minPrice, maxPrice, status } = query
    const skip = (page - 1) * limit

    // Build filter
    const filter: Record<string, unknown> = {}
    if (status) {
      filter.status = status
    }
    if (collection) {
      filter.collections = collection
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" }
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.$gte = minPrice
      if (maxPrice) priceFilter.$lte = maxPrice
      filter.salePrice = priceFilter
    }

    // Build sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 }
    if (sort === "price-asc") {
      sortOption = { salePrice: 1 }
    } else if (sort === "price-desc") {
      sortOption = { salePrice: -1 }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, sku, ...rest } = validation.data

    // Check if SKU already exists
    const existing = await Product.findOne({ sku })
    if (existing) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 })
    }

    const slug = slugify(name)
    const slugExisting = await Product.findOne({ slug })
    if (slugExisting) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 })
    }

    const product = await Product.create({
      name,
      slug,
      sku,
      ...rest,
    })

    await invalidateProductsCache()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
