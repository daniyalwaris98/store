"use client"

import Link from "next/link"
import { formatCurrency, getCustomerDisplayName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order } from "@/types"

interface RecentOrdersTableProps {
  orders: Order[]
}

const statusColors: Record<Order["stage"], string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Recent Orders</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">View All</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{getCustomerDisplayName(order.customer)}</TableCell>
              <TableCell>{formatCurrency(order.total, order.currency)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.stage]}`}>
                  {order.stage.charAt(0).toUpperCase() + order.stage.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/orders/${order._id}`}>Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}