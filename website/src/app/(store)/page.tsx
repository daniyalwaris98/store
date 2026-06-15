import { HeroCarousel } from "@/components/ui/hero-carousel"
import { CollectionSection } from "@/components/features/collection/CollectionSection"
import CollectionGrid from "@/components/features/collection/collection-grid"
import { FeaturesSection } from "@/components/features/homepage/features-section"
import { SpecialProductsSection } from "@/components/features/homepage/special-products"
import { ReviewsSection } from "@/components/features/homepage/reviews-section"
import { FAQSection } from "@/components/features/faq/FAQSection"
import { BrandShowcase } from "@/components/features/homepage/brand-showcase"
import { TikTokVideosCarousel } from "@/components/features/homepage/tiktok-videos"

export const revalidate = 60

export default function HomePage() {
  return (
    <div className="w-full mx-auto flex flex-col">
      {/* Hero Slider */}
      <section>
        <HeroCarousel
          desktopImages={[
            "/slider/desktop-1.webp",
            "/slider/desktop-2.webp",
            "/slider/desktop-3.webp",
          ]}
          mobileImages={[
            "/slider/mobile-1.webp",
            "/slider/mobile-2.webp",
            "/slider/mobile-3.webp",
          ]}
          autoPlayInterval={5000}
        />
      </section>

      {/* Featured Collection */}
      <CollectionSection slug="featured" title="Our Top Choice" />

      {/* Features */}
      <FeaturesSection />

      {/* Special products */}
      <SpecialProductsSection />

      {/* Tiktok Videos of our brand section */}
      <TikTokVideosCarousel
        title="See Us In Action"
        videos={[
          { src: "/videos/1.mp4" },
          { src: "/videos/2.mp4" },
          { src: "/videos/3.mp4" },
          { src: "/videos/4.mp4" },
          { src: "/videos/5.mp4" },
          { src: "/videos/6.mp4" },
        ]}
      />

      {/* Shop by Category */}
      <CollectionGrid />

      {/* Review Section */}
      <ReviewsSection />

      {/* FAQ section */}
      <FAQSection
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our products and services"
        items={[
          {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for all unused items in their original packaging. Simply contact our support team to initiate a return, and we'll guide you through the process. Refunds are processed within 5-7 business days after receiving the returned item.",
          },
          {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 5-7 business days within the country. Express shipping options are available for faster delivery at checkout. International shipping may take 10-14 business days depending on the destination and customs processing.",
          },
          {
            question: "Do you offer international shipping?",
            answer: "Yes! We ship to over 100 countries worldwide. Shipping rates and delivery times vary by location. You can see the available options and estimated costs at checkout.",
          },
          {
            question: "How can I track my order?",
            answer: "Once your order ships, you'll receive an email with a tracking number and link. You can also track your order status by logging into your account and viewing your order history.",
          },
        ]}
      />

      {/* Brand Showcase */}
      <BrandShowcase />

    </div>
  )
}
