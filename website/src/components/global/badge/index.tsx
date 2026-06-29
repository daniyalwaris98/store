"use client"

import Image from "next/image"

interface BadgeProps {
  imageUrl: string
  placement?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center"
  size?: number
}

export function Badge({ imageUrl, placement = "top-right", size = 48 }: BadgeProps) {
  const placementClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "top-center": "top-2 left-1/2 -translate-x-1/2",
    "center-left": "top-1/2 left-2 -translate-y-1/2",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "center-right": "top-1/2 right-2 -translate-y-1/2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "bottom-center": "bottom-2 left-1/2 -translate-x-1/2",
  }

  return (
    <div
      className={`absolute ${placementClasses[placement]}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt=""
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  )
}