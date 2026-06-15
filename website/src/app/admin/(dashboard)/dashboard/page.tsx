"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAdminOrders } from "@/hooks"
import { formatCurrency, getCustomerDisplayName } from "@/lib/utils"
import { useCurrency } from "@/context/CurrencyContext"
import { productQuerySchema } from "@/lib/validators/product"
import { customerQuerySchema } from "@/lib/validators/customer"

interface DashboardStats {
  totalRevenue: number
  ordersCount: number
  productsCount: number
  customersCount: number
  revenueChange: string
  ordersChange: string
}

export default function AdminDashboard() {
  const { orders, isLoading: ordersLoading, fetchOrders } = useAdminOrders()
  const { defaultCurrency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
    revenueChange: "+0%",
    ordersChange: "+0%",
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    fetchOrders({ limit: 5 })
  }, [fetchOrders])

  useEffect(() => {
    async function loadStats() {
      setIsLoadingStats(true)
      try {
        const productsQuery = productQuerySchema.parse({ limit: 1, page: 1, sort: "newest" })
        const customersQuery = customerQuerySchema.parse({ limit: 1, page: 1 })

        const [ordersRes, productsRes, customersRes] = await Promise.all([
          axios.get("/api/orders", { params: { page: 1, limit: 1 } }),
          axios.get("/api/products", { params: productsQuery }),
          axios.get("/api/customers", { params: customersQuery }),
        ])

        const ordersData = ordersRes.data
        const productsData = productsRes.data
        const customersData = customersRes.data

        // Calculate total revenue from orders
        let totalRevenue = 0
        if (orders.length > 0) {
          totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
        }

        setStats({
          totalRevenue,
          ordersCount: ordersData.pagination?.total || 0,
          productsCount: productsData.pagination?.total || 0,
          customersCount: customersData.pagination?.total || 0,
          revenueChange: "+12.5%",
          ordersChange: "+8.2%",
        })
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [orders])

  const stageColors = {
    unpaid: "bg-warning-light text-warning",
    processing: "bg-accent-light text-accent",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-success-light text-success",
  }

  const statCards = [
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue, defaultCurrency), change: stats.revenueChange, icon: DollarSign },
    { title: "Orders", value: stats.ordersCount.toString(), change: stats.ordersChange, icon: ShoppingCart },
    { title: "Products", value: stats.productsCount.toString(), change: `+${stats.productsCount}`, icon: Package },
    { title: "Customers", value: stats.customersCount.toString(), change: `+${stats.customersCount}`, icon: Users },
  ]

  console.log("orders : ",orders)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button className="w-full sm:w-auto">Download Report</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-secondary">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-card transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong gap-4"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-5 w-5 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{order.orderNumber}</p>
                        <p className="text-sm text-secondary truncate">
                          {getCustomerDisplayName(order.customer)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-bold">{formatCurrency(order.total, order.currency)}</p>
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${stageColors[order.stage]}`}
                      >
                        {order.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/products/new">
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/collections">
                <Layers className="h-4 w-4 mr-2" />
                Manage Collections
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Pending Orders
              </Link>
            </Button>
            <Separator className="my-4" />
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/">
                <Clock className="h-4 w-4 mr-2" />
                View Storefront
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[300px] flex items-center justify-center bg-background-muted border border-border rounded-lg">
            <p className="text-secondary">Chart visualization coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
