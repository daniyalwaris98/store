"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { VideoCard } from "./VideoCard"
import { VideoModal } from "./VideoModal"

interface TikTokVideo {
  src: string
  poster?: string
  title?: string
}

interface TikTokVideosProps {
  title?: string
  videos: TikTokVideo[]
}

export function TikTokVideosCarousel({ title = "TikTok Videos of Our Brand", videos }: TikTokVideosProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      containScroll: false,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  )

  const openModal = (index: number) => setSelectedIndex(index)
  const closeModal = () => setSelectedIndex(null)

  return (
    <>
      <section className="w-full bg-primary py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-8 text-center">{title}</h2>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex tiktok-carousel-container">
              {videos.map((video, index) => (
                <VideoCard
                  key={video.src}
                  src={video.src}
                  poster={video.poster}
                  index={index}
                  onClick={() => openModal(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedIndex !== null && (
        <VideoModal
          src={videos[selectedIndex].src}
          isOpen={selectedIndex !== null}
          onClose={closeModal}
        />
      )}
    </>
  )
}