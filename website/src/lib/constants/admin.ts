// src/lib/constants/admin.ts - Admin Configuration (env-only, no fallback)

export const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((e: string) => e.trim()) ?? []