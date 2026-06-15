import { ProductCard } from "@/components/global/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CollectionSectionProps {
  id?: string
  slug?: string
  title: string
}

interface Product {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency?: string
  prices?: Record<string, { salePrice: number; originalPrice?: number }>
  gallery?: { url: string; type: "image" | "video"; order: number }[]
  stickerId?: { imageUrl: string; placement: string }
}

interface CollectionApiResponse {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  products: Product[]
}

async function getCollectionWithProducts(idOrSlug: string): Promise<CollectionApiResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const res = await fetch(`${baseUrl}/api/collections/public/${idOrSlug}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to fetch collection: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching collection:", error)
    return null
  }
}

export async function CollectionSection({ id, slug, title }: CollectionSectionProps) {
  const collection = await getCollectionWithProducts(id ?? slug ?? "")

  if (!collection || !collection.products?.length) {
    return null
  }

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {collection.products.slice(0, 6).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {collection.products.length === 6 && (
          <div className="mt-8 text-center">
            <Button
              variant="default"
              asChild
            >
              <Link href={`/collections/${collection.slug}`}>
                View All Products
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}