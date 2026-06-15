"use client"

import Image from "next/image"

interface BadgeProps {
  imageUrl: string
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  size?: number
}

export function Badge({ imageUrl, placement = "top-right", size = 48 }: BadgeProps) {
  const placementClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  }

  return (
    <div
      className={`absolute ${placementClasses[placement]} w-12 h-12`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt=""
        width={size * 2}
        height={size * 2}
        className="w-full h-full  object-contain"
      />
    </div>
  )
}