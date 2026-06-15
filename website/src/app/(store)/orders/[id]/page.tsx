"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/context/CurrencyContext"
import { CheckCircle, Package, MapPin, Clock, ArrowLeft } from "lucide-react"
import type { Order } from "@/types"

interface OrderDetailProps {
  params: Promise<{ id: string }>
}

export default function OrderConfirmationPage({ params }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currency } = useCurrency()

  useEffect(() => {
    async function fetchOrder() {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/orders/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Order not found")
          } else {
            setError("Failed to load order")
          }
          return
        }
        const data = await response.json()
        setOrder(data)
      } catch {
        setError("Failed to load order")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params])

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The order you are looking for does not exist."}</p>
          <Button asChild>
            <Link href="/">Return to Store</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stageColors = {
    unpaid: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
  }

  const stageLabels = {
    unpaid: "Awaiting Payment",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-muted-foreground">
            Your order has been placed successfully.
          </p>
        </div>

        {/* Order Info Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[order.stage]}`}>
                {stageLabels[order.stage]}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const image = !item.product || typeof item.product === 'string'
                  ? null
                  : item.product.gallery?.[0]?.url

                return (
                  <div key={index} className="flex gap-4">
                    <div className="h-20 w-20 bg-muted rounded-xl shrink-0 relative">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.name}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-muted" />
                      )}
                      <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground text-background text-xs px-1.5 font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      {item.variantId && (
                        <p className="text-xs text-muted-foreground mt-0.5">Variant: {item.variantId}</p>
                      )}
                      {(item as unknown as { customMeasurements?: Record<string, string> }).customMeasurements &&
                        Object.keys((item as unknown as { customMeasurements: Record<string, string> }).customMeasurements).length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-medium text-accent">Custom Size:</p>
                          <p className="text-xs text-muted-foreground">
                            {Object.entries((item as unknown as { customMeasurements: Record<string, string> }).customMeasurements)
                              .map(([k, v]) => `${k}: ${v}"`)
                              .join(", ")}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatCurrency(item.price, currency)} each
                      </p>
                    </div>
                    <div className="text-sm font-medium shrink-0">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shippingCost, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.country}</p>
              {order.items[0] && (
                <p className="text-sm text-muted-foreground mt-2">
                  Delivery estimate: 3-5 business days
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.stage === "unpaid" ? (
                <p className="text-sm text-muted-foreground">
                  Please complete payment to proceed with your order.
                </p>
              ) : order.stage === "processing" ? (
                <p className="text-sm text-muted-foreground">
                  Your order is being prepared for shipment.
                </p>
              ) : order.stage === "shipped" ? (
                <p className="text-sm text-muted-foreground">
                  Your order has been shipped and is on its way.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your order has been delivered. Thank you!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}