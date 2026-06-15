"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Eye, Truck, CheckCircle, Package } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminOrders, useDebounce } from "@/hooks"
import { formatCurrency, getCustomerDisplayName } from "@/lib/utils"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { orders, pagination, isLoading, error, fetchOrders, updateStage } = useAdminOrders()
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const params: Record<string, unknown> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (stageFilter !== "all") params.stage = stageFilter
    if (paymentFilter !== "all") params.status = paymentFilter
    fetchOrders(params)
  }, [debouncedSearch, stageFilter, paymentFilter, fetchOrders])

  const handleUpdateStage = async (orderId: string, newStage: "shipped" | "delivered") => {
    await updateStage(orderId, { stage: newStage })
  }

  const stageColors = {
    unpaid: "bg-warning-light text-warning",
    processing: "bg-accent-light text-accent",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-success-light text-success",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search orders..."
            className="pl-9 sm:pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-background-subtle">
              <TableHead className="w-10 px-3">
                <input type="checkbox" className="rounded cursor-pointer accent-accent" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Order</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Total</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Payment</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Stage</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-16 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-secondary">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order._id}
                  className="group cursor-pointer hover:bg-background-subtle/50 transition-colors"
                  onClick={() => router.push(`/admin/orders/${order._id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded cursor-pointer accent-accent"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 bg-background-muted border border-border rounded-md overflow-hidden shrink-0">
                        {typeof order.items[0]?.product === "object" && order.items[0]?.product?.gallery?.[0]?.url ? (
                          <img src={order.items[0].product.gallery[0].url} alt={order.items[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px] lg:max-w-[300px]">{order.items[0]?.name}</p>
                        {order.items[0]?.variantOptions && Object.keys(order.items[0].variantOptions).length > 0 && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] lg:max-w-[300px]">
                            {Object.entries(order.items[0].variantOptions).map(([key, value]) => `${key}: ${value}`).join(" / ")}
                          </p>
                        )}
                        {order.items.length > 1 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 1} more item{order.items.length - 1 > 1 ? "s" : ""}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {getCustomerDisplayName(order.customer)}
                    </p>
                    <p className="text-sm text-secondary">
                      {(order.customer && typeof order.customer !== "string") ? order.customer.email : ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(order.total, order.currency)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-success-light text-success"
                          : "bg-warning-light text-warning"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[order.stage]}`}
                    >
                      {order.stage}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order._id}`}>
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {order.stage === "processing" && (
                          <DropdownMenuItem onClick={() => handleUpdateStage(order._id, "shipped")}>
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {order.stage === "shipped" && (
                          <DropdownMenuItem onClick={() => handleUpdateStage(order._id, "delivered")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-secondary">
          Showing {orders.length} of {pagination.total} orders
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={pagination.page <= 1}>
            Previous
          </Button>
          <Button variant="outline">{pagination.page}</Button>
          <Button variant="outline" disabled={pagination.page >= pagination.pages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
