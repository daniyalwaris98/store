import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { connectDB } from "@/lib/db/mongodb"
import { Sticker } from "@/lib/db/models/Sticker"
import { updateStickerSchema } from "@/lib/validators/sticker"
import { getSession } from "@/lib/auth/session"
import { DeleteImage } from "@/app/api/uploads/[publicId]/route"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const sticker = await Sticker.findById(id)

    if (!sticker) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 })
    }

    return NextResponse.json(sticker)
  } catch (error) {
    console.error("GET /api/stickers/[id] error:", error)
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
    const validation = updateStickerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    await connectDB()
    const sticker = await Sticker.findByIdAndUpdate(id, validation.data, { new: true })

    if (!sticker) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 })
    }

    return NextResponse.json(sticker)
  } catch (error) {
    console.error("PUT /api/stickers/[id] error:", error)
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
    const sticker = await Sticker.findByIdAndDelete(id)

    if (!sticker) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 })
    }

    if (sticker.imageUrl) {
      try {
        await DeleteImage(sticker.imageUrl)
      } catch (err) {
        console.error("Failed to delete asset:", err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/stickers/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}