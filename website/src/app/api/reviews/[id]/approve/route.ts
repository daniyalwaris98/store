import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Review } from "@/lib/db/models/Review"
import { reviewActionSchema } from "@/lib/validators/review"
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
    const validation = reviewActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status: validation.data.status },
      { new: true }
    )

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("PATCH /api/reviews/[id]/approve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}