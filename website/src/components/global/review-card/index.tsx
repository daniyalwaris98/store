"use client"

import { Review } from "@/types/review"
import Image from "next/image"
import { Star } from "lucide-react"

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-3 p-4 border border-border rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          {review.verified && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h4 className="font-medium">{review.title}</h4>
      <p className="text-sm text-muted-foreground">{review.body}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-2">
          {review.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              width={130}
              height={130}
              className="object-cover rounded-xl"
            />
          ))}
        </div>
      )}

      {review.customer && (
        <p className="text-xs text-muted-foreground">By {review.customer}</p>
      )}

      {onHelpful && (
        <button
          onClick={() => onHelpful(review._id)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Helpful ({review.helpful || 0})
        </button>
      )}
    </div>
  )
}