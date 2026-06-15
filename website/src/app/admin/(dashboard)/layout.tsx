"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  Star,
  Tag,
  Ruler,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ToastContainer } from "@/context/ToastContext"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Collections", href: "/admin/collections", icon: Layers },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Stickers", href: "/admin/stickers", icon: Tag },
  { name: "Size Charts", href: "/admin/size-charts", icon: Ruler },
  { name: "Filter Sets", href: "/admin/filter-sets", icon: Filter },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background max-md:flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background-subtle">
        <div className="p-5 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-secondary hover:bg-background-muted hover:text-foreground hover:shadow-sm hover:-translate-y-0.5"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/">
            <Button variant="outline" className="w-full">
              View Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background-subtle px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Admin</span>
              </Link>
            </div>
            <nav className="p-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out",
                      isActive
                        ? "bg-accent text-white shadow-sm font-semibold"
                        : "text-secondary hover:bg-background-muted hover:text-foreground hover:shadow-sm hover:-translate-y-0.5"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  View Store
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold tracking-tight">Admin</span>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <ToastContainer>{children}</ToastContainer>
      </main>
    </div>
  )
}
