"use client"

import { useState } from "react"
import { formatCurrency, getCustomerDisplayName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/types"

interface OrderDetailPanelProps {
  order: Order
  onStatusChange?: (status: Order["stage"]) => void
}

const statusColors: Record<Order["stage"], string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

const statusOptions: Order["stage"][] = ["unpaid", "processing", "shipped", "delivered"]

export function OrderDetailPanel({ order, onStatusChange }: OrderDetailPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.stage)

  const handleStatusUpdate = () => {
    onStatusChange?.(selectedStatus)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.stage]}`}>
          {order.stage.charAt(0).toUpperCase() + order.stage.slice(1)}
        </span>
      </div>

      {/* Customer Info */}
      <div>
        <h3 className="font-semibold mb-2">Customer</h3>
        <div className="text-sm">
          <p>{getCustomerDisplayName(order.customer)}</p>
          <p className="text-muted-foreground">
            {(order.customer && typeof order.customer !== "string") ? order.customer.email : ""}
          </p>
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-3">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => {
            const itemName = item.product
              ? (typeof item.product === "string" ? item.name : ("name" in item.product ? item.product.name : item.name))
              : item.name || "Deleted Product"
            const itemVariant = "variantOptions" in item ? Object.values(item.variantOptions || {}).join(", ") : ""
            return (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{itemName}</p>
                  {itemVariant && (
                    <p className="text-muted-foreground text-xs">{itemVariant}</p>
                  )}
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity, order.currency)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div>
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <address className="text-sm not-italic">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </address>
        </div>
      )}

      <Separator />

      {/* Total */}
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatCurrency(order.total, order.currency)}</span>
      </div>

      {/* Status Management */}
      {onStatusChange && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Update Status</h3>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            {selectedStatus !== order.stage && (
              <Button onClick={handleStatusUpdate} className="mt-2">
                Update Status
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}