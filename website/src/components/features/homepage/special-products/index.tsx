import Image from "next/image"
import Link from "next/link"
import { Product } from "@/types"
import { ArrowRight } from "lucide-react"

interface SpecialProductCardProps {
  product: Product
  variant: "hero" | "standard" | "wide"
  className?: string
  imageIndex?: number
}

function SpecialProductCard({ product, variant, className = "", imageIndex = 0 }: SpecialProductCardProps) {
  const images = product.gallery?.filter((g) => g.type === "image") || []
  const image = images[imageIndex]?.url || images[0]?.url || "/placeholder.svg"
  const hasDiscount = product.originalPrice && product.originalPrice > product.salePrice
  const discountPercent = hasDiscount
    ? Math.round((1 - product.salePrice / product.originalPrice!) * 100)
    : 0

  const isHero = variant === "hero"

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative block overflow-hidden rounded-xl bg-white ${className}`}
    >
      {/* Image Container — always 1:1 for standard/wide, fills height for hero */}
      <div
        className={`relative w-full overflow-hidden bg-background-muted ${
          isHero ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"
        }`}
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes={
            isHero
              ? "(max-width: 768px) 100vw, 50vw"
              : variant === "wide"
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient overlay — bottom fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/15 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className={`absolute z-10 ${isHero ? "top-4 left-4" : "top-2.5 left-2.5"}`}>
            <span className="inline-flex items-center rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Content overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end ${
            isHero ? "p-5 md:p-7" : "p-3 md:p-4"
          }`}
        >
          {/* CTA — slides up on hover */}
          <div className="translate-y-3 mb-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 font-medium text-white transition-colors duration-200 group-hover:bg-white/25 ${
                isHero ? "px-4 py-2 text-xs" : "px-2.5 py-1 text-[10px]"
              }`}
            >
              Shop Now
              <ArrowRight className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isHero ? "h-3.5 w-3.5" : "h-2.5 w-2.5"}`} />
            </span>
          </div>
          {/* Product Name */}
          <h3
            className={`font-semibold text-white leading-snug mb-1.5 line-clamp-2 ${
              isHero ? "text-base md:text-xl" : "text-xs md:text-sm"
            }`}
          >
            {product.name}
          </h3>

          {/* Price Row */}
          <div className={`flex items-baseline gap-2`}>
            <span
              className={`font-bold text-white ${
                isHero ? "text-base md:text-lg" : "text-xs md:text-sm"
              }`}
            >
              Rs. {product.salePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span
                className={`text-white/50 line-through ${
                  isHero ? "text-xs md:text-sm" : "text-[10px] md:text-xs"
                }`}
              >
                Rs. {product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Subtle inner ring */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-all duration-300 group-hover:ring-white/20" />
      </div>
    </Link>
  )
}

async function getProduct(slug: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error("Error fetching special product:", error)
    return null
  }
}

export async function SpecialProductsSection() {
  const product = await getProduct("unstitched-clothing-copy")

  if (!product) return null

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Special Products
        </h2>

        {/* ─── Desktop Bento Grid (md+) ─── */}

        <div className="hidden md:grid md:gap-4" style={{ gridTemplateColumns: "65fr 35fr" }}>
          {/* Left — Hero card spanning full height of right column */}
          <div className="row-span-2">
            <SpecialProductCard
              product={product}
              variant="hero"
              className="h-full"
              imageIndex={0}
            />
          </div>

          {/* Right Top — 2 standard cards side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <SpecialProductCard product={product} variant="standard" imageIndex={1} />
            <SpecialProductCard product={product} variant="standard" imageIndex={2} />
          </div>

          {/* Right Bottom — 1 wide card */}
          <SpecialProductCard product={product} variant="wide" imageIndex={3} />
        </div>

        {/* ─── Mobile Layout ─── */}

        <div className="grid grid-cols-1 gap-3 md:hidden">
          <SpecialProductCard product={product} variant="hero" imageIndex={0} />
          <div className="grid grid-cols-2 gap-3">
            <SpecialProductCard product={product} variant="standard" imageIndex={1} />
            <SpecialProductCard product={product} variant="standard" imageIndex={2} />
          </div>
          <SpecialProductCard product={product} variant="wide" imageIndex={3} />
        </div>
      </div>
    </section>
  )
}
