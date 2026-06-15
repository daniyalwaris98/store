"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

interface Video {
  id: string
  thumbnail: string
  videoUrl: string
  title?: string
}

interface FeaturedVideosProps {
  videos: Video[]
  title?: string
}

export function FeaturedVideos({
  videos,
  title = "Featured Videos",
}: FeaturedVideosProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  if (videos.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{title}</h2>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-shrink-0 w-[280px] md:w-[320px]"
            >
              {playingVideo === video.id ? (
                <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden">
                  <video
                    src={video.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    onEnded={() => setPlayingVideo(null)}
                  />
                </div>
              ) : (
                <div
                  className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setPlayingVideo(video.id)}
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title || "Video thumbnail"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Title */}
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {video.title}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}