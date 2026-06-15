"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"

interface HeroCarouselProps {
  desktopImages: string[]
  mobileImages: string[]
  autoPlayInterval?: number
}

export function HeroCarousel({
  desktopImages,
  mobileImages,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
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

  // Autoplay
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, autoPlayInterval)
    return () => clearInterval(interval)
  }, [emblaApi, autoPlayInterval])

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden shadow-lg">
        {/* Embla container */}
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {desktopImages.map((_, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] snap-start relative max-h-200"
              >
                {/* Desktop image */}
                <img
                  src={desktopImages[index]}
                  alt={`Slide ${index + 1}`}
                  className="hidden md:block w-full h-full object-cover object-center"
                />
                {/* Mobile image */}
                <img
                  src={mobileImages[index]}
                  alt={`Slide ${index + 1}`}
                  className="block md:hidden w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlay for text readability (desktop only) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent hidden md:block pointer-events-none" />

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {desktopImages.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
