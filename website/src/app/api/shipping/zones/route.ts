import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { ShippingZone } from "@/lib/db/models/ShippingZone"
import { createShippingZoneSchema } from "@/lib/validators/shipping"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const zones = await ShippingZone.find().sort({ createdAt: -1 })
    return NextResponse.json(zones)
  } catch (error) {
    console.error("GET /api/shipping/zones error:", error)
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
    const validation = createShippingZoneSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const zone = await ShippingZone.create(validation.data)
    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    console.error("POST /api/shipping/zones error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}