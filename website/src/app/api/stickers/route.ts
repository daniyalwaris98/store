import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { connectDB } from "@/lib/db/mongodb"
import { Sticker } from "@/lib/db/models/Sticker"
import { createStickerSchema, updateStickerSchema } from "@/lib/validators/sticker"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    await connectDB()
    const stickers = await Sticker.find().sort({ createdAt: -1 })
    return NextResponse.json(stickers)
  } catch (error) {
    console.error("GET /api/stickers error:", error)
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
    const validation = createStickerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const sticker = await Sticker.create(validation.data)
    return NextResponse.json(sticker, { status: 201 })
  } catch (error) {
    console.error("POST /api/stickers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}