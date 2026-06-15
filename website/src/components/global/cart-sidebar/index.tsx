"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency } from "@/lib/utils"

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCart()
  const { currency } = useCurrency()

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={closeCart} variant="outline">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="h-20 w-20 bg-muted rounded-xl shrink-0 relative overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {item.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    )}

                    {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variantOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" / ")}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Separator />
              <Button asChild className="w-full" size="lg" onClick={closeCart}>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
