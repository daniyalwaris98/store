"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromoBannerProps {
  message: string
  link?: string
  cta?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function PromoBanner({
  message,
  link,
  cta,
  dismissible = true,
  onDismiss,
}: PromoBannerProps) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div className="bg-primary text-primary-foreground py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm md:text-base font-medium">{message}</p>

          {link && cta && (
            <Button asChild size="sm" variant="secondary" className="hidden md:flex">
              <a href={link}>{cta}</a>
            </Button>
          )}

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}