import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { ShippingZone } from "@/lib/db/models/ShippingZone"
import { getSession } from "@/lib/auth/session"

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

    const zone = await ShippingZone.findByIdAndUpdate(id, body, { new: true })
    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    return NextResponse.json(zone)
  } catch (error) {
    console.error("PUT /api/shipping/zones/[id] error:", error)
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
    const zone = await ShippingZone.findByIdAndDelete(id)

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/shipping/zones/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}