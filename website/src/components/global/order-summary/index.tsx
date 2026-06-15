"use client"

import { CartItem } from "@/types/cart"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/context/CurrencyContext"
import { Separator } from "@/components/ui/separator"

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shippingCost?: number
  tax?: number
  currency?: string
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost = 0,
  tax = 0,
  currency = "USD",
}: OrderSummaryProps) {
  const { currency: selectedCurrency } = useCurrency()
  const effectiveCurrency = currency || selectedCurrency
  const total = subtotal + shippingCost + tax

  return (
    <div className="space-y-4 p-4 border border-border rounded-xl">
      <h3 className="font-semibold">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatCurrency(item.price * item.quantity, effectiveCurrency)}
            </p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal, effectiveCurrency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {shippingCost === 0 ? "Free" : formatCurrency(shippingCost, effectiveCurrency)}
          </span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(tax, effectiveCurrency)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total, effectiveCurrency)}</span>
      </div>
    </div>
  )
}