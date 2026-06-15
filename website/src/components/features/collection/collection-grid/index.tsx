import { getCachedCollections } from "@/lib/cache"
import { CollectionGridItem } from "./CollectionGridItem"
import type { Collection as CollectionType } from "@/types/collection"

export default async function CollectionGrid() {
  const allCollections = await getCachedCollections()
  const collections: CollectionType[] = allCollections.filter((c: CollectionType) => c._id && !c.parent)

  if (!collections || collections.length === 0) {
    return null
  }

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {collections.map((collection, index) => (
            <CollectionGridItem
              key={collection._id}
              collection={collection}
              isFullWidth={collections.length % 2 === 1 && index === collections.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}