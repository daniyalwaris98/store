"use client"

import { useState, useEffect, Fragment as ReactFragment } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, Mail, Phone, Trash2 } from "lucide-react"
import axios from "axios"
import type { Order, OrderStage } from "@/types/order"

const STAGE_CONFIG: Record<OrderStage, { label: string; icon: typeof Clock; nextStage?: OrderStage }> = {
  unpaid: { label: "Unpaid", icon: Clock, nextStage: "processing" },
  processing: { label: "Processing", icon: Package, nextStage: "shipped" },
  shipped: { label: "Shipped", icon: Truck, nextStage: "delivered" },
  delivered: { label: "Delivered", icon: CheckCircle },
}

const STAGE_ORDER: OrderStage[] = ["unpaid", "processing", "shipped", "delivered"]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stageNote, setStageNote] = useState("")
  const [targetStage, setTargetStage] = useState<OrderStage | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get<Order>(`/api/orders/${orderId}`)
        setOrder(data)
      } catch {
        setError("Failed to load order")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleStageUpdate = async (newStage: OrderStage, note?: string) => {
    setIsUpdating(true)
    try {
      const { data } = await axios.patch<Order>(`/api/orders/${orderId}`, {
        stage: newStage,
        note,
      })
      setOrder(data)
      setNoteDialogOpen(false)
      setStageNote("")
    } catch {
      setError("Failed to update order stage")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    try {
      await axios.delete(`/api/orders/${orderId}`)
      router.push("/admin/orders")
    } catch {
      setError("Failed to delete order")
      setIsUpdating(false)
      setDeleteDialogOpen(false)
    }
  }

  const openNoteDialog = (stage: OrderStage) => {
    setTargetStage(stage)
    setStageNote("")
    setNoteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/admin/orders" className="text-primary hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  const customerInfo = typeof order.customer === "object" ? order.customer : null
  const currentStageIndex = STAGE_ORDER.indexOf(order.stage)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Order #{order.orderNumber}</h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Order
        </Button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 overflow-auto">
          {/* Stage Progress */}
          <div className="border border-border rounded-lg p-4 ">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Order Status</h2>
              <span className="text-sm text-muted-foreground capitalize">{order.stage}</span>
            </div>
            <div className="flex items-center justify-between mt-4 overflow-x-auto gap-1">
              {STAGE_ORDER.map((stage, index) => {
                const config = STAGE_CONFIG[stage]
                const Icon = config.icon
                const isCompleted = index <= currentStageIndex
                const isCurrent = stage === order.stage

                return (
                  <ReactFragment key={stage}>
                    <div className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-primary text-background"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-xs mt-1.5 ${
                            isCurrent ? "font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                    {index < STAGE_ORDER.length - 1 && (
                      <div
                        className={`h-0.5 w-8 mx-1 mb-4 ${
                          index < currentStageIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </ReactFragment>
                );
              })}
            </div>

            {STAGE_CONFIG[order.stage].nextStage && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => {
                    const next = STAGE_CONFIG[order.stage].nextStage
                    if (next) openNoteDialog(next)
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : `Mark as ${STAGE_CONFIG[STAGE_CONFIG[order.stage].nextStage!].label}`}
                </Button>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-14 w-14 bg-muted rounded-lg shrink-0 relative overflow-hidden">
                    {item.product && typeof item.product === "object" && item.product.gallery?.[0]?.url && (
                      <img src={item.product.gallery[0].url} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Object.entries(item.variantOptions).map(([key, value]) => `${key}: ${value}`).join(" / ")}
                      </p>
                    )}
                    {(item as unknown as { customMeasurements?: Record<string, string> }).customMeasurements &&
                      Object.keys((item as unknown as { customMeasurements: Record<string, string> }).customMeasurements).length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-medium text-accent">Custom Measurements:</p>
                        <p className="text-xs text-muted-foreground">
                          {Object.entries((item as unknown as { customMeasurements: Record<string, string> }).customMeasurements)
                            .map(([k, v]) => `${k}: ${v}"`)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                    {item.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(item.price, order.currency)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium shrink-0">
                    {formatCurrency(item.price * item.quantity, order.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shippingCost, order.currency)}</span>
              </div>
              <div className="flex justify-between font-medium text-sm pt-1.5 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Stage History */}
          {order.stageHistory && order.stageHistory.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3">Stage History</h2>
              <div className="space-y-3">
                {order.stageHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium capitalize">{entry.stage}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                      {entry.note && <p className="text-xs mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Customer</h2>
            <div className="space-y-2.5">
              {customerInfo ? (
                <>
                  {customerInfo.name && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">{customerInfo.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm">{customerInfo.email}</span>
                  </div>
                  {customerInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">{customerInfo.phone}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{typeof order.customer === "string" ? order.customer : "Guest"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {(order.shippingAddress || order.country) && (
            <div className="border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3">Shipping Address</h2>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm">
                  {order.shippingAddress ? (
                    <>
                      {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                      <p>
                        {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode || ""}
                      </p>
                      <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">Country: {order.country}</p>
                      {customerInfo?.addresses && customerInfo.addresses.length > 0 ? (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          {customerInfo.addresses.map((addr, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode || ""} — {addr.country}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-2">No address stored for this order</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{order._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize text-xs">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fulfillment</span>
                <span className="capitalize text-xs">{order.fulfillmentStatus.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-xs">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note (Optional)</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note" className="text-sm">Note for this stage update</Label>
            <textarea
              id="note"
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              placeholder="Add tracking number, notes, etc..."
              className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNoteDialogOpen(false)}>
              Skip
            </Button>
            <Button
              size="sm"
              onClick={() => targetStage && handleStageUpdate(targetStage, stageNote || undefined)}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{order.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              {isUpdating ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
