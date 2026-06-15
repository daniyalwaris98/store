import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { connectDB } from "@/lib/db/mongodb"
import { SizeChart } from "@/lib/db/models/SizeChart"
import { updateSizeChartSchema } from "@/lib/validators/sizeChart"
import { getSession } from "@/lib/auth/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const sizeChart = await SizeChart.findById(id)

    if (!sizeChart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 })
    }

    return NextResponse.json(sizeChart)
  } catch (error) {
    console.error("GET /api/size-charts/[id] error:", error)
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
    const validation = updateSizeChartSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    await connectDB()
    const sizeChart = await SizeChart.findByIdAndUpdate(id, validation.data, { new: true })

    if (!sizeChart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 })
    }

    return NextResponse.json(sizeChart)
  } catch (error) {
    console.error("PUT /api/size-charts/[id] error:", error)
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
    await connectDB()
    const sizeChart = await SizeChart.findByIdAndDelete(id)

    if (!sizeChart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/size-charts/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}