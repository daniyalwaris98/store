"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowLeft, User, Mail, Phone, MapPin, Package, Pencil, Trash2, Plus } from "lucide-react"
import axios from "axios"
import type { Customer, CustomerAddress } from "@/types"
import type { Order, OrderListResponse } from "@/types/order"

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", phone: "" })
  const [editLoading, setEditLoading] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [addressForm, setAddressForm] = useState<Partial<CustomerAddress>>({})
  const [addressLoading, setAddressLoading] = useState(false)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await axios.get<Customer>(`/api/customers/${customerId}`)
        setCustomer(data)
        setEditForm({ name: data.name || "", phone: data.phone || "" })
      } catch {
        setError("Failed to load customer")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer?.email) return
      setOrdersLoading(true)
      try {
        const { data } = await axios.get<OrderListResponse>("/api/orders", {
          params: { customerEmail: customer.email, limit: 50 },
        })
        setOrders(data.orders)
      } catch (err) {
        console.error("[CustomerDetail] Failed to fetch orders:", err)
      } finally {
        setOrdersLoading(false)
      }
    }

    if (customer?.email) {
      fetchOrders()
    }
  }, [customer])

  const handleSaveEdit = async () => {
    setEditLoading(true)
    try {
      const { data } = await axios.put<Customer>(`/api/customers/${customerId}`, editForm)
      setCustomer(data)
      setEditOpen(false)
    } catch {
      setError("Failed to update customer")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await axios.delete(`/api/customers/${customerId}`)
      window.location.href = "/admin/customers"
    } catch {
      setError("Failed to delete customer")
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  const handleAddAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.country) return
    setAddressLoading(true)
    try {
      const newAddress = {
        label: addressForm.label || "Home",
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state || undefined,
        country: addressForm.country,
        postalCode: addressForm.postalCode || undefined,
      }
      const currentAddresses = customer?.addresses || []
      const { data } = await axios.put<Customer>(`/api/customers/${customerId}`, {
        addresses: [...currentAddresses, newAddress],
      })
      setCustomer(data)
      setAddressDialogOpen(false)
      setAddressForm({})
    } catch {
      setError("Failed to add address")
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteAddress = async (index: number) => {
    if (!customer) return
    const newAddresses = customer.addresses.filter((_, i) => i !== index)
    try {
      const { data } = await axios.put<Customer>(`/api/customers/${customerId}`, { addresses: newAddresses })
      setCustomer(data)
    } catch {
      setError("Failed to delete address")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer not found</p>
        <Link href="/admin/customers" className="text-primary hover:underline mt-2 inline-block">
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="text-sm text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {customer.name || "Guest"} — {customer.email}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="border border-border rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({orders.length})
            </h2>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="font-medium hover:text-primary"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.stage === "delivered" ? "bg-success/10 text-success" :
                          order.stage === "shipped" ? "bg-info/10 text-info" :
                          order.stage === "processing" ? "bg-warning/10 text-warning" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {order.stage}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total, order.currency)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="h-12 w-12 rounded-lg bg-muted shrink-0 relative overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : item.product && typeof item.product === "object" && item.product.gallery?.[0]?.url ? (
                            <img src={item.product.gallery[0].url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          {order.items.length > 4 && idx === 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Items summary */}
                    <div className="text-sm text-muted-foreground mb-2">
                      {order.items.map((item) => item.name).slice(0, 2).join(", ")}
                      {order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                        {order.shippingAddress && ` • ${order.shippingAddress.city}, ${order.shippingAddress.country}`}
                      </span>
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-primary hover:underline"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.name || "No name"}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
              Customer since {formatDate(customer.createdAt)}
            </div>
          </div>

          {/* Addresses */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses ({customer.addresses?.length || 0})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setAddressDialogOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address, index) => (
                  <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div className="text-sm">
                      {address.label && (
                        <p className="font-medium text-xs text-muted-foreground mb-1">{address.label}</p>
                      )}
                      <p>{address.street}</p>
                      <p>
                        {address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode || ""}
                      </p>
                      <p className="text-muted-foreground">{address.country}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No addresses</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete customer <strong>{customer.name || customer.email}</strong>?
              This action cannot be undone and will not delete their orders.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={addressForm.label || ""}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                placeholder="Home, Work, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Street *</Label>
              <Input
                value={addressForm.street || ""}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={addressForm.city || ""}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={addressForm.state || ""}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  value={addressForm.postalCode || ""}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input
                  value={addressForm.country || ""}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAddress}
              disabled={addressLoading || !addressForm.street || !addressForm.city || !addressForm.country}
            >
              {addressLoading ? "Adding..." : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}