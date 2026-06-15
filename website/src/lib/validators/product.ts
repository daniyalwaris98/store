import { z } from "zod"

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  compareAt: z.number().min(0).optional(),
  inventory: z.number().int().min(0).optional(),
  options: z.record(z.string(), z.string()),
})

export const galleryItemSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video"]),
  order: z.number().int().min(0),
})

export const currencyPriceSchema = z.object({
  salePrice: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
})

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  originalPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0),
  currency: z.string().default("USD"),
  prices: z.record(z.string(), currencyPriceSchema).optional(),
  weight: z.number().min(0).optional(),
  sku: z.string().min(1, "SKU is required"),
  inventory: z.number().int().min(0).optional(),
  trackInventory: z.boolean().default(false),
  gallery: z.array(galleryItemSchema).optional(),
  collections: z.array(z.string()).min(1, "Product must belong to at least one collection"),
  variants: z.array(productVariantSchema).optional(),
  stickerId: z.string().optional(),
  sizeChartId: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  collection: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
})

export const updateInventorySchema = z.object({
  inventory: z.number().int().min(0),
})

export type ProductVariant = z.infer<typeof productVariantSchema>
export type GalleryItem = z.infer<typeof galleryItemSchema>
export type CurrencyPrice = z.infer<typeof currencyPriceSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
