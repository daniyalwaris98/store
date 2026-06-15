import { revalidateTag } from "next/cache"

export function invalidateCollectionsCache() {
  revalidateTag("collections", "default")
  revalidateTag("products", "default")
}

export function invalidateProductsCache() {
  revalidateTag("products", "default")
}

export function invalidateAllCaches() {
  revalidateTag("collections", "default")
  revalidateTag("products", "default")
}