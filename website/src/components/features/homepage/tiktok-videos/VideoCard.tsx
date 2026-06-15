"use client"

import { useRef, useEffect, useState } from "react"
import { Play } from "lucide-react"

interface VideoCardProps {
  src: string
  poster?: string
  index: number
  onClick: () => void
}

export function VideoCard({ src, poster, index, onClick }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer for viewport detection
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // Autoplay muted when in view
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isInView && !isHovered) {
      video.play().catch(() => {})
      video.muted = true
    } else {
      video.pause()
    }
  }, [isInView, isHovered])

  return (
    /* Outer wrapper: Embla slide sizing + gap via padding */
    <div className="tiktok-carousel-slide flex-shrink-0 min-w-0">
      {/* Inner card: visual styling */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-900"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Video element with 9:16 aspect ratio */}
        <div className="aspect-[9/16] w-full">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button overlay - appears on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
      </div>
    </div>
  )
}