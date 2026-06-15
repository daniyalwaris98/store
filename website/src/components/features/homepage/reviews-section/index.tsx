import { Review } from "@/types/review"
import { ReviewsCarousel } from "./ReviewsCarousel"

interface ReviewsSectionProps {
  title?: string
  subtitle?: string
}

async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/reviews/featured`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.reviews || []
  } catch {
    return []
  }
}

export async function ReviewsSection({
  title = "Customer Reviews",
  subtitle = "What our customers are saying",
}: ReviewsSectionProps) {
  const reviews = await getFeaturedReviews()

  if (reviews.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  )
}