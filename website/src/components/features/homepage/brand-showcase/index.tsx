"use client"

import { BRAND } from "@/lib/constants/brand"

interface BrandShowcaseProps {
  brandName?: string
  tagline?: string
}

export function BrandShowcase({
  brandName = BRAND.name,
  tagline = BRAND.tagline,
}: BrandShowcaseProps) {
  return (
    <section className="relative w-full overflow-hidden bg-primary">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-br from-white/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-linear-to-t from-white/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-32 md:py-20 lg:py-24">
        {/* Made In Pakistan Badge */}
        <div className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm md:text-base text-white/90 font-medium">
            Pakistani Brand
          </span>
        </div>

        {/* Brand Name */}
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 md:mb-6">
          {brandName}
        </h2>

        {/* Tagline */}
        <p className="text-md md:text-lg lg:text-xl text-white/80 tracking-widest uppercase font-light">
          {tagline}
        </p>

        {/* Decorative Line */}
        <div className="mt-8 md:mt-12 w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
    </section>
  )
}