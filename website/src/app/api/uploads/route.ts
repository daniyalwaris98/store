import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { Asset } from "@/lib/db/models/Asset"
import { uploadToSeaweed } from "@/lib/seaweed"
import { getSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = formData.get("folder") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const result = await uploadToSeaweed(file, { folder: folder || undefined })

    await Asset.create({
      publicId: result.publicId,
      url: result.url,
      type: result.type,
      folder: folder || "misc",
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("POST /api/uploads error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}