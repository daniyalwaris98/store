import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { getCurrencyConfig } from "@/lib/currency"

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const config = getCurrencyConfig(currency)
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getCustomerDisplayName(
  customer: string | null | { _id: string; name?: string; email: string; phone?: string; addresses?: unknown[] }
): string {
  if (!customer) return "Deleted Customer"
  if (typeof customer === "string") return customer
  return customer.name || customer.email || "Unknown"
}

export function getProductDisplayName(
  product: string | null | { _id: string; name: string; gallery?: unknown[] }
): string {
  if (!product) return "Deleted Product"
  if (typeof product === "string") return "Product"
  return product.name
}
