import type { Collection } from "@/types"

export interface CollectionTree {
  collection: Collection
  children: Collection[]
}

export function buildCollectionTree(collections: Collection[]): CollectionTree[] {
  const roots = collections.filter((c) => !c.parent)
  const sorted = (arr: Collection[]) => arr.sort((a, b) => a.order - b.order)

  return sorted(roots).map((root) => ({
    collection: root,
    children: sorted(collections.filter((c) => c.parent === root._id)),
  }))
}
