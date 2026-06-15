"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RecentPurchase {
  orderNumber: string
  customerName: string
  productName: string
  productImage?: string
  timestamp: string
}

export function SalePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState<RecentPurchase | null>(null)

  useEffect(() => {
    async function fetchRecentPurchases() {
      try {
        const { data } = await axios.get<{ purchases: RecentPurchase[] }>("/api/recent-purchase")
        const purchases = data.purchases

        if (purchases.length > 0) {
          // Pick a random purchase for the popup
          const randomIndex = Math.floor(Math.random() * purchases.length)
          setCurrentPurchase(purchases[randomIndex])

          // Trigger popup after delay
          const minDelay = 10000
          const randomDelay = Math.floor(Math.random() * 30000) + 10000

          const timer = setTimeout(() => {
            if (!isDismissed) {
              setIsVisible(true)
            }
          }, minDelay + randomDelay)

          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error("Failed to fetch recent purchases:", error)
      }
    }

    fetchRecentPurchases()
  }, [isDismissed])

  useEffect(() => {
    if (isVisible) {
      const dismissTimer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      return () => clearTimeout(dismissTimer)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || !currentPurchase) {
    return null
  }

  const timeAgo = formatTimeAgo(currentPurchase.timestamp)

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto z-50 max-w-sm mx-auto sm:mx-0 sm:ml-auto animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-white border shadow-lg rounded-xl p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 animate-pulse" />
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{currentPurchase.customerName}</span>{" "}
              just purchased
            </p>
            <Link
              href="/products/premium-cotton-t-shirt"
              className="font-medium hover:text-primary"
            >
              {currentPurchase.productName}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}
