import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Review } from "@/lib/db/models/Review"
import { createReviewSchema, reviewQuerySchema, adminCreateReviewSchema } from "@/lib/validators/review"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const isAdmin = !!session.isAdmin

    const { searchParams } = new URL(request.url)
    const rawQuery = {
      productId: searchParams.get("productId") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    }
    const query = reviewQuerySchema.parse(rawQuery)

    const { productId, status, search, page, limit } = query
    const skip = (page - 1) * limit

    // Admin can see all statuses, public only sees approved
    const filter: Record<string, unknown> = {}
    if (productId) filter.product = productId
    if (isAdmin && status) {
      filter.status = status
    } else if (!isAdmin) {
      filter.status = "approved"
    }
    if (search && isAdmin) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
      ]
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ])

    // Calculate rating stats
    const stats = await Review.aggregate([
      { $match: { product: productId ? productId : undefined, status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])

    return NextResponse.json({
      reviews,
      stats: stats[0] || { avgRating: 0, count: 0 },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/reviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const isAdmin = !!session.isAdmin
    const body = await request.json()

    // Admin can create reviews directly with approved status
    if (isAdmin) {
      const validation = adminCreateReviewSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation error", details: validation.error.issues },
          { status: 400 }
        )
      }

      const review = await Review.create(validation.data)
      return NextResponse.json(review, { status: 201 })
    }

    // Public review submission
    const validation = createReviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const review = await Review.create({
      ...validation.data,
      status: "pending",
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("POST /api/reviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}