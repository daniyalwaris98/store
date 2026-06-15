import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_EMAILS } from "@/lib/constants/admin"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow access to login page without auth check
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith("/admin/")) {
    const sessionCookie = request.cookies.get("admin_session")
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const [email] = sessionCookie.value.split(":")
    if (!email || !ADMIN_EMAILS.includes(email)) {
      const response = NextResponse.redirect(new URL("/admin", request.url))
      response.cookies.delete("admin_session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}