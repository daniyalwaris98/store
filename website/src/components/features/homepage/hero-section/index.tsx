"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  cta?: string
}

interface HeroSectionProps {
  slides: HeroSlide[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function HeroSection({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  if (slides.length === 0) return null

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              absolute inset-0 transition-opacity duration-700
              ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-lg md:text-xl text-white/90 mb-6">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta && slide.link && (
                    <Link href={slide.link}>
                      <Button size="lg" className="text-lg px-8">
                        {slide.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}