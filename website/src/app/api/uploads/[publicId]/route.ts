import "@/lib/db/mongodb"
import { Asset } from "@/lib/db/models/Asset"
import { deleteFromSeaweed } from "@/lib/seaweed"

export async function DeleteImage(publicIdOrUrl: string) {
  const decoded = decodeURIComponent(publicIdOrUrl)
  const isUrl = decoded.startsWith("http")
  const asset = isUrl
    ? await Asset.findOne({ url: decoded })
    : await Asset.findOne({ publicId: decoded })

  if (!asset) {
    throw new Error("Asset not found")
  }

  await deleteFromSeaweed(asset.publicId)
  await Asset.findOneAndDelete({ publicId: asset.publicId })
}

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicId } = await params

    if (!publicId) {
      return NextResponse.json({ error: "ID not provided" }, { status: 400 })
    }

    await DeleteImage(publicId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/uploads/[publicId] error:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}