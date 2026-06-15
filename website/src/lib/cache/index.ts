import { unstable_cache } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Collection } from "@/lib/db/models/Collection"
import { Product } from "@/lib/db/models/Product"

export const getCachedCollections = unstable_cache(
  async () => {
    await connectDB()
    const collections = await Collection.find({ status: "active", showInMenu: { $ne: false } })
      .sort({ order: 1, name: 1 })
      .lean()
    return JSON.parse(JSON.stringify(collections))
  },
  ["collections-list"],
  { revalidate: 900, tags: ["collections"] }
)

export const getCachedCollection = unstable_cache(
  async (slug: string) => {
    await connectDB()
    const collection = await Collection.findOne({ slug, status: "active" }).lean()
    return collection ? JSON.parse(JSON.stringify(collection)) : null
  },
  ["collection-detail"],
  { revalidate: 900, tags: ["collections"] }
)

export const getCachedProductsByCollection = unstable_cache(
  async (collectionSlug: string) => {
    await connectDB()
    const collection = await Collection.findOne({ slug: collectionSlug, status: "active" }).lean()
    if (!collection) return []

    const childCollections = await Collection.find(
      { parent: collection._id, status: "active" },
      "_id"
    ).lean()
    const allCollectionIds = [collection._id, ...childCollections.map((c) => c._id)]

    const products = await Product.find({
      collections: { $in: allCollectionIds },
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean()

    return JSON.parse(JSON.stringify(products))
  },
  ["collection-products"],
  { revalidate: 300, tags: ["products"] }
)

export const getCachedProduct = unstable_cache(
  async (slugOrId: string) => {
    await connectDB()
    const isValidId = /^[a-fA-F0-9]{24}$/.test(slugOrId)
    const query = isValidId ? { _id: slugOrId } : { slug: slugOrId }
    const product = await Product.findOne({ ...query, status: "active" }).lean()
    return product ? JSON.parse(JSON.stringify(product)) : null
  },
  ["product-detail"],
  { revalidate: 600, tags: ["products"] }
)

export const getCachedProductList = unstable_cache(
  async (params: Record<string, unknown> = {}) => {
    await connectDB()
    const filter: Record<string, unknown> = { status: "active" }

    if (params.collection) {
      const collection = await Collection.findOne({ slug: params.collection as string }).lean()
      if (collection) {
        const childCollections = await Collection.find(
          { parent: collection._id, status: "active" },
          "_id"
        ).lean()
        const allCollectionIds = [collection._id, ...childCollections.map((c) => c._id)]
        filter.collections = { $in: allCollectionIds }
      }
    }

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
      ]
    }

    let query = Product.find(filter)

    if (params.sort === "price-asc") {
      query = query.sort({ salePrice: 1 })
    } else if (params.sort === "price-desc") {
      query = query.sort({ salePrice: -1 })
    } else if (params.sort === "newest") {
      query = query.sort({ createdAt: -1 })
    } else {
      query = query.sort({ order: 1, createdAt: -1 })
    }

    const page = parseInt(params.page as string) || 1
    const limit = parseInt(params.limit as string) || 20
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ])

    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  },
  ["product-list"],
  { revalidate: 300, tags: ["products"] }
)