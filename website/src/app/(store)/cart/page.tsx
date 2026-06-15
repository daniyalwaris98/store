"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart()
  const { currency } = useCurrency()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-xl hover:bg-background-muted transition-colors">
              <div className="h-24 w-24 sm:h-24 sm:w-24 bg-muted rounded-xl shrink-0">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={180}
                    height={180}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium">
                      <Link href={`/products/${item.productId}`} className="hover:text-primary">
                        {item.name}
                      </Link>
                    </h3>
                    {item.sku && (
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-danger p-2 -m-2 shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-11 w-11 min-w-11 flex items-center justify-center border border-border rounded-lg hover:bg-background-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-11 w-11 min-w-11 flex items-center justify-center border border-border rounded-lg hover:bg-background-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button asChild variant="outline" className="w-full mt-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4 lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
