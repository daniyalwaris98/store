"use client"

import { useEffect, useCallback } from "react"
import { X } from "lucide-react"

interface VideoModalProps {
  src: string
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ src, isOpen, onClose }: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close video"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Video container - maintains 9:16 aspect ratio, centered */}
      <div
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-[9/16] w-full">
          <video
            src={src}
            controls
            autoPlay
            className="h-full w-full object-cover"
            playsInline
          />
        </div>
      </div>

      {/* Swipe down hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        Tap outside or press ESC to close
      </div>
    </div>
  )
}