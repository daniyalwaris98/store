import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { connectDB } from "@/lib/db/mongodb"
import { SizeChart } from "@/lib/db/models/SizeChart"
import { createSizeChartSchema, updateSizeChartSchema } from "@/lib/validators/sizeChart"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    await connectDB()
    const sizeCharts = await SizeChart.find().sort({ createdAt: -1 })
    return NextResponse.json(sizeCharts)
  } catch (error) {
    console.error("GET /api/size-charts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createSizeChartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const sizeChart = await SizeChart.create(validation.data)
    return NextResponse.json(sizeChart, { status: 201 })
  } catch (error) {
    console.error("POST /api/size-charts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}