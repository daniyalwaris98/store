import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/validators/auth"
import { login, createSessionCookie } from "@/lib/auth/session"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production"
const JWT_EXPIRES_IN = "7d"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    const result = await login(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    await createSessionCookie(email)

    // Generate JWT token for mobile app
    const token = jwt.sign(
      { email, isAdmin: true },
      JWT_SECRET
      // { expiresIn: JWT_EXPIRES_IN }
    )

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
