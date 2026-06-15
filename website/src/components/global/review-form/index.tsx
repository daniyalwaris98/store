"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  productId: string
  onSubmit?: (review: { rating: number; title: string; body: string; images?: string[] }) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({ productId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit?.({ rating, title, body, images })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="review-body">Review</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  )
}