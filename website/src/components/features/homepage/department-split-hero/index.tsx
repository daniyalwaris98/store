"use client"

import Link from "next/link"
import Image from "next/image"

interface Department {
  title: string
  subtitle: string
  href: string
  imageUrl: string
  colorTheme: string
}

const DEPARTMENTS: Department[] = [
  {
    title: "WOMEN",
    subtitle: "Elegant & Modern Designs",
    href: "/collections/women",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    colorTheme: "from-rose-950/40",
  },
  {
    title: "MEN",
    subtitle: "Timeless & Sophisticated Styles",
    href: "/collections/men",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    colorTheme: "from-blue-950/40",
  },
  {
    title: "KIDS",
    subtitle: "Comfy & Playful Playwear",
    href: "/collections/kids",
    imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
    colorTheme: "from-amber-950/40",
  },
]

export function DepartmentSplitHero() {
  return (
    <section className="w-full py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[50vh] md:h-[65vh] w-full gap-2 px-2">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.title}
            href={dept.href}
            className="group relative h-full w-full flex items-center justify-center overflow-hidden rounded-xl border border-border/10 shadow-sm"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full bg-muted">
              <Image
                src={dept.imageUrl}
                alt={dept.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${dept.colorTheme} via-black/10 to-black/30 opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 text-white">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-wider drop-shadow-sm mb-1">
                {dept.title}
              </h2>
              <p className="text-xs md:text-sm text-white/90 font-medium tracking-wide mb-4 drop-shadow-sm max-w-xs">
                {dept.subtitle}
              </p>
              <span className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-full tracking-wider uppercase shadow-md group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:translate-y-[-2px]">
                Explore Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
