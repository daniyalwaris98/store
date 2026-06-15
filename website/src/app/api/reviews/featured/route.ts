import { NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Review } from "@/lib/db/models/Review"
import { connectDB } from "@/lib/db/mongodb"

export async function GET() {
  try {
    await connectDB()
    const reviews = await Review.find({
      status: "approved",
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("GET /api/reviews/featured error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}