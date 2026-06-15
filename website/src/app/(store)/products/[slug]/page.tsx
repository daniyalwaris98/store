import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/features/product/product-details";
import { FeaturesSection } from "@/components/features/homepage/features-section";
import { FAQSection } from "@/components/features/faq/FAQSection";
import { BrandShowcase } from "@/components/features/homepage/brand-showcase";
import { ReviewsSection } from "@/components/features/homepage/reviews-section";
import { CollectionSection } from "@/components/features/collection/CollectionSection";
import { Product } from "@/types";
import { TikTokVideosCarousel } from "@/components/features/homepage/tiktok-videos";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${slug}`, {
    next: { revalidate: 300, tags: ["products"] },
  });

  if (!res.ok) {
    return notFound();
  }

  const product = await res.json() as Product & {
    sizeChartId?: {
      _id: string
      name: string
      images: string[]
      columns: string[]
      rows: { size: string; measurements: string[] }[]
      allowCustomSize: boolean
      customSizeFields: string[]
    }
  }

  return (
    <div className="w-full mx-auto flex flex-col">
      <ProductDetails product={product} />
      <ReviewsSection />

      <FeaturesSection />

      {product.collections?.length > 0 && (
        <CollectionSection id={product.collections[0]} title="You May Also Like" />
      )}

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

      <CollectionSection slug="featured" title="Our Top Choice" />

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

      <BrandShowcase />
    </div>
  );
}