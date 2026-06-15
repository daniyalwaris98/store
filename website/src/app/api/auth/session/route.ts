import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json(session)
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      { email: null, isAdmin: false },
      { status: 500 }
    )
  }
}
