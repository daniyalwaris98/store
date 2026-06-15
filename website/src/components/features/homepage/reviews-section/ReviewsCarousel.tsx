"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Star, CheckCircle } from "lucide-react"
import { Review } from "@/types/review"
import { ImageLightbox, ImageLightboxTrigger, ImageLightboxContent } from "@/components/ui/lightbox"

interface ReviewsCarouselProps {
  reviews: Review[]
  autoPlayInterval?: number
}

export function ReviewsCarousel({ reviews, autoPlayInterval = 5000 }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index)
      }
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, autoPlayInterval)
    return () => clearInterval(interval)
  }, [emblaApi, autoPlayInterval])

  if (reviews.length === 0) return null

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] snap-start px-2"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {reviews.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-muted hover:bg-muted-foreground"
              )}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`}
        />
      ))}
    </div>
  )

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 h-full flex flex-col">
      {/* Top: Name + Stars inline */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">{review.customer || "Anonymous"}</span>
        <div className="flex items-center gap-2">
          {review.verified && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              Verified
            </span>
          )}
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mb-2 text-foreground">{review.title}</h4>

      {/* Body */}
      <p className="text-sm text-secondary leading-relaxed line-clamp-3">{review.body}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap pb-1">
          {review.images.map((image, index) => (
            <ImageLightbox key={index}>
              <ImageLightboxTrigger asChild>
                <button className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer shrink-0 ring-1 ring-border">
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    width={110}
                    height={110}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </button>
              </ImageLightboxTrigger>
              <ImageLightboxContent>
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
              </ImageLightboxContent>
            </ImageLightbox>
          ))}
        </div>
      )}
    </div>
  )
}