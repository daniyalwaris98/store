import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { PushToken } from "@/lib/db/models/PushToken"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, pushToken, platform } = body

    if (!email || !pushToken) {
      return NextResponse.json({ error: "Email and pushToken are required" }, { status: 400 })
    }

    // Verify admin auth - check for JWT token in Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string; isAdmin: boolean }
      if (!decoded.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Upsert push token by pushToken (each device gets its own entry)
    await PushToken.findOneAndUpdate(
      { pushToken },
      { pushToken, email, platform: platform || "android" },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Register push token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verify admin auth
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string; isAdmin: boolean }
      if (!decoded.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()
    await PushToken.deleteMany({ email })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete push token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}