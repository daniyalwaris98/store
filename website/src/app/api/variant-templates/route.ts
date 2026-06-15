import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { VariantTemplate } from "@/lib/db/models/VariantTemplate"

export async function GET() {
  try {
    await connectDB()
    const templates = await VariantTemplate.find().sort({ name: 1 }).lean()
    return NextResponse.json(templates)
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, options } = body

    if (!name || !options || !Array.isArray(options)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    await connectDB()
    const template = await VariantTemplate.create({ name, options })
    return NextResponse.json(template, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}