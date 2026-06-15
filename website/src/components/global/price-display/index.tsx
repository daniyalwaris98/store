"use client"

import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/context/CurrencyContext"

interface PriceDisplayProps {
  price: number
  compareAtPrice?: number
  currency?: string
  size?: "sm" | "md" | "lg"
  showDiscount?: boolean
}

export function PriceDisplay({
  price,
  compareAtPrice,
  currency = "USD",
  size = "md",
  showDiscount = true,
}: PriceDisplayProps) {
  const { currency: selectedCurrency } = useCurrency()
  const effectiveCurrency = currency || selectedCurrency
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold ${sizeClasses[size]}`}>
        {formatCurrency(price, effectiveCurrency)}
      </span>

      {hasDiscount && (
        <>
          <span className={`text-muted-foreground line-through ${sizeClasses[size]}`}>
            {formatCurrency(compareAtPrice, effectiveCurrency)}
          </span>
          {showDiscount && (
            <span className="text-xs font-semibold text-danger">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </div>
  )
}