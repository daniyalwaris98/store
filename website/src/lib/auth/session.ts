import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { ADMIN_EMAILS } from "@/lib/constants/admin"

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production"
// const SESSION_TTL = 60 * 60 * 24 // 24 hours — kept for reference

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123"

function createSignature(email: string, timestamp: string): string {
  const data = `${email}:${timestamp}`
  return crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex")
}

function verifySignature(email: string, timestamp: string, sig: string): boolean {
  try {
    const expected = createSignature(email, timestamp)
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))
  } catch {
    return false
  }
}

function verifyBearerToken(authHeader: string | null): { email: string | null; isAdmin: boolean } {
  if (!authHeader?.startsWith("Bearer ")) {
    return { email: null, isAdmin: false }
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as { email: string; isAdmin: boolean }
    if (payload.isAdmin && ADMIN_EMAILS.includes(payload.email)) {
      return { email: payload.email, isAdmin: true }
    }
    return { email: null, isAdmin: false }
  } catch {
    return { email: null, isAdmin: false }
  }
}

function parseSessionCookie(sessionId: string): { email: string | null; timestamp: string | null; signature: string | null } {
  const parts = sessionId.split(":")
  if (parts.length !== 3) {
    return { email: null, timestamp: null, signature: null }
  }
  return { email: parts[0], timestamp: parts[1], signature: parts[2] }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!ADMIN_EMAILS.includes(email)) {
    return { success: false, error: "Invalid credentials" }
  }

  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: "Invalid credentials" }
  }

  return { success: true }
}

export async function createSessionCookie(email: string): Promise<string> {
  const timestamp = Date.now().toString()
  const signature = createSignature(email, timestamp)
  const sessionId = `${email}:${timestamp}:${signature}`

  const cookieStore = await cookies()
  cookieStore.set("admin_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours — kept for reference (SESSION_TTL removed for permanent sessions)
    path: "/",
  })

  return sessionId
}

export async function getSession(): Promise<{ email: string | null; isAdmin: boolean }> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin_session")?.value

  if (!sessionId) {
    return { email: null, isAdmin: false }
  }

  const { email, timestamp, signature } = parseSessionCookie(sessionId)

  if (!email || !timestamp || !signature) {
    return { email: null, isAdmin: false }
  }

  if (!ADMIN_EMAILS.includes(email)) {
    return { email: null, isAdmin: false }
  }

  if (!verifySignature(email, timestamp, signature)) {
    return { email: null, isAdmin: false }
  }

  // Session never expires (SESSION_TTL check removed for permanent sessions)
  // const sessionAge = Date.now() - parseInt(timestamp, 10)
  // if (sessionAge > SESSION_TTL * 1000) {
  //   return { email: null, isAdmin: false }
  // }

  return { email, isAdmin: true }
}

export async function getServerSession(request: NextRequest): Promise<{ email: string | null; isAdmin: boolean }> {
  // Try Bearer token first (mobile app)
  const authHeader = request.headers.get("authorization")
  const bearerResult = verifyBearerToken(authHeader)
  if (bearerResult.isAdmin) {
    return bearerResult
  }

  // Fall back to cookie session (browser)
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return { email: null, isAdmin: false }
  }

  const { email, timestamp, signature } = parseSessionCookie(sessionCookie.value)

  if (!email || !timestamp || !signature) {
    return { email: null, isAdmin: false }
  }

  if (!ADMIN_EMAILS.includes(email)) {
    return { email: null, isAdmin: false }
  }

  if (!verifySignature(email, timestamp, signature)) {
    return { email: null, isAdmin: false }
  }

  return { email, isAdmin: true }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}

export function adminMiddleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email, timestamp, signature } = parseSessionCookie(sessionCookie.value)

  if (!email || !timestamp || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!verifySignature(email, timestamp, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Session never expires (SESSION_TTL check removed for permanent sessions)
  // const sessionAge = Date.now() - parseInt(timestamp, 10)
  // if (sessionAge > SESSION_TTL * 1000) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  return null
}