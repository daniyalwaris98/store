"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Package, MapPin, CreditCard, Settings, ChevronRight } from "lucide-react"

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account and preferences
        </p>

        {/* Account Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Guest Account</p>
                    <p className="text-sm text-muted-foreground">Sign in to access your account</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="grid gap-2">
            <Link href="/orders" className="block">
              <Card className="hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">My Orders</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Addresses</span>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Payment Methods</span>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Preferences</span>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Note */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Customer accounts and login are coming soon. For now, you can track your orders using your order number and email.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}