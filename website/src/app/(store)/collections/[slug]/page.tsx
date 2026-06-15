import { notFound } from "next/navigation"
import { CollectionClient } from "./CollectionClient"
import { getCachedCollection, getCachedProductsByCollection } from "@/lib/cache"
import type { CollectionProduct } from "@/types"

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params

  const [collection, products] = await Promise.all([
    getCachedCollection(slug),
    getCachedProductsByCollection(slug),
  ])

  if (!collection) {
    notFound()
  }

  return (
    <CollectionClient
      name={collection.name}
      description={collection.description}
      slug={collection.slug}
      products={products as CollectionProduct[]}
    />
  )
}