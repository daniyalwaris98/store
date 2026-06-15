import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { VariantTemplate } from "@/lib/db/models/VariantTemplate"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, options } = body

    if (!name || !options || !Array.isArray(options)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    await connectDB()
    const template = await VariantTemplate.findByIdAndUpdate(
      id,
      { name, options },
      { new: true }
    ).lean()

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch {
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    const template = await VariantTemplate.findByIdAndDelete(id)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}