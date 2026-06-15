"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Search, ChevronRight, MapPin, CreditCard, Calendar, AlertCircle, ArrowLeft } from "lucide-react"
import type { OrderLookupResponse } from "@/types/order"

const stageConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: "Unpaid", className: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

interface OrderDisplayProps {
  order: OrderLookupResponse
  onSearchAgain: () => void
}

function OrderDisplay({ order, onSearchAgain }: OrderDisplayProps) {
  const stage = stageConfig[order.stage] || stageConfig.unpaid
  const customer = order.customer as OrderLookupResponse["customer"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Order {order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage.className}`}>
          {stage.label}
        </span>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              {item.image ? (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                {item.variantId && (
                  <p className="text-xs text-muted-foreground">Variant: {item.variantId}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {formatPrice(item.price, order.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.price * item.quantity, order.currency)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(order.shippingCost, order.currency)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{customer.name}</p>
                <p>{customer.addresses[0].street}</p>
                <p>{customer.addresses[0].city}{customer.addresses[0].state ? `, ${customer.addresses[0].state}` : ""}</p>
                <p>{customer.addresses[0].postalCode} {customer.addresses[0].country}</p>
                {customer.phone && <p className="text-muted-foreground mt-2">{customer.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address on file</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Cash on Delivery (COD)</p>
            <p className="text-sm text-muted-foreground capitalize">
              Payment {order.paymentStatus === "paid" ? "paid" : "pending"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage History */}
      {order.stageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.stageHistory.map((history, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium capitalize">{history.stage}</span>
                    <span className="text-muted-foreground ml-2">
                      {formatDate(history.timestamp)}
                    </span>
                    {history.note && (
                      <p className="text-muted-foreground text-xs mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onSearchAgain} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Search Another Order
        </Button>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}

function LookupFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [order, setOrder] = useState<OrderLookupResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Order not found")
      }

      const data: OrderLookupResponse = await response.json()
      setOrder(data)
      setStatus("success")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  const handleSearchAgain = () => {
    setOrderNumber("")
    setEmail("")
    setOrder(null)
    setErrorMessage("")
    setStatus("idle")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground mb-8">
          View your order history and track deliveries
        </p>

        {status === "loading" && <LookupFormSkeleton />}

        {status === "idle" && (
          <>
            {/* Order Lookup Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLookup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="e.g., ORD-123456"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email used for your order"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Find Order
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Need help finding your order?</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for order confirmation with your order number.
                  If you still need help, contact our support team.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact support
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {status === "error" && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Order Not Found</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {errorMessage || "We couldn't find an order with those details. Please check your order number and email address."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSearchAgain}
                    className="mt-4 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "success" && order && (
          <OrderDisplay order={order} onSearchAgain={handleSearchAgain} />
        )}
      </div>
    </div>
  )
}