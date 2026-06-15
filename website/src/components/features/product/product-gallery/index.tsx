"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageLightbox, ImageLightboxTrigger, ImageLightboxContent } from "@/components/ui/lightbox"

interface GalleryItem {
  url: string
  type: "image" | "video"
  order: number
}

interface ProductGalleryProps {
  items: GalleryItem[]
  productName: string
}

export function ProductGallery({ items, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const thumbnailRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const sortedItems = [...items].sort((a, b) => a.order - b.order)
  const images = sortedItems.filter((item) => item.type === "image")
  const totalImages = images.length

  const goToPrev = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => (prev - 1 + totalImages) % totalImages)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [totalImages, isTransitioning])

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => (prev + 1) % totalImages)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [totalImages, isTransitioning])

  const goToPrevSet = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => Math.max(0, prev - 4))
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning])

  const goToNextSet = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => Math.min(totalImages - 1, prev + 4))
    setTimeout(() => setIsTransitioning(false), 300)
  }, [totalImages, isTransitioning])


  const selectedItem = sortedItems[selectedIndex]
  const isVideo = selectedItem?.type === "video"

  // Scroll thumbnail into view when selected
  useEffect(() => {
    if (thumbnailRef.current && totalImages > 4) {
      const thumbnail = thumbnailRef.current.children[selectedIndex] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [selectedIndex, totalImages])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
    touchEndX.current = 0
    touchStartX.current = 0
  }

  const handleThumbnailClick = (index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const globalIndex = sortedItems.findIndex(
      (item) => item.type === "image" && images.findIndex((img) => img.url === item.url) === index
    )
    setSelectedIndex(globalIndex >= 0 ? globalIndex : index)
    setIsPlaying(false)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const showThumbnails = totalImages > 1
  const showScrollIndicators = totalImages > 4

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div
        className="relative aspect-square bg-muted rounded-xl overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isVideo || selectedItem?.type === "video" ? (
          <>
            {isPlaying ? (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src="/placeholder.svg"
                  alt={productName}
                  width={1100}
                  height={1100}
                  className="object-cover"
                />
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
                  </div>
                </button>
              </div>
            )}
          </>
        ) : (
          <ImageLightbox>
            <ImageLightboxTrigger asChild>
              <div
                className={cn(
                  "relative w-full h-full cursor-pointer transition-opacity duration-300",
                  isTransitioning && "opacity-0"
                )}
              >
                <Image
                  src={selectedItem?.url || "/placeholder.svg"}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </ImageLightboxTrigger>
            <ImageLightboxContent>
              <img
                src={selectedItem?.url || "/placeholder.svg"}
                alt={productName}
                className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              />
            </ImageLightboxContent>
          </ImageLightbox>
        )}

        {/* Navigation Arrows */}
        {showThumbnails && !isVideo && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {showThumbnails && !isVideo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-sm rounded-full font-medium">
            {selectedIndex + 1} / {totalImages}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="relative">
          {/* Left fade gradient */}
          {showScrollIndicators && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
          )}

          {/* Desktop navigation arrows */}
          {showScrollIndicators && (
            <>
              <button
                onClick={goToPrevSet}
                disabled={selectedIndex === 0}
                className="absolute left-0 top-0 bottom-0 z-20 items-center justify-center w-8 bg-background/80 hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous 4 images"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNextSet}
                disabled={selectedIndex >= totalImages - 1}
                className="absolute right-0 top-0 bottom-0 z-20 items-center justify-center w-8 bg-background/80 hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next 4 images"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            ref={thumbnailRef}
            className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${showScrollIndicators && "px-8"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((item, index) => {
              const globalIndex = sortedItems.findIndex(
                (i) => i.url === item.url && i.type === item.type
              )
              return (
                <button
                  key={`${item.url}-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200",
                    selectedIndex === globalIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-border-strong"
                  )}
                >
                  <Image
                    src={item.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    width={140}
                    height={140}
                    className="object-cover w-full h-full"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
