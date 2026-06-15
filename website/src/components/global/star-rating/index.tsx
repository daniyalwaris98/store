"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const StarComponent = interactive ? "button" : "div"
  const starProps = interactive
    ? {
        onMouseEnter: () => setHoverRating(rating),
        onMouseLeave: () => setHoverRating(0),
        onClick: () => onRatingChange?.(rating),
      }
    : {}

  return (
    <div className="flex gap-0.5" {...starProps}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1
        const filled = starValue <= (hoverRating || rating)

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
          />
        )
      })}
    </div>
  )
}