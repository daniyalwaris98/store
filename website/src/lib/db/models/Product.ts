import mongoose, { Schema, type Document } from "mongoose"

export interface IProductVariant {
  sku: string
  name: string
  price: number
  compareAt?: number
  prices?: Record<string, { salePrice: number; originalPrice?: number }>
  inventory?: number
  options: Record<string, string>
}

export interface IGalleryItem {
  url: string
  type: "image" | "video"
  order: number
}

export interface ICurrencyPrice {
  salePrice: number
  originalPrice?: number
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  originalPrice?: number
  salePrice: number
  currency: string
  prices?: Map<string, ICurrencyPrice>
  weight?: number
  sku: string
  inventory?: number
  trackInventory: boolean
  gallery: IGalleryItem[]
  collections: mongoose.Types.ObjectId[]
  variants: IProductVariant[]
  stickerId?: mongoose.Types.ObjectId
  sizeChartId?: mongoose.Types.ObjectId
  status: "active" | "draft" | "archived"
  createdAt: Date
  updatedAt: Date
}

const CurrencyPriceSchema = new Schema<ICurrencyPrice>({
  salePrice: { type: Number, required: true },
  originalPrice: { type: Number },
}, { _id: false })

const ProductVariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  compareAt: { type: Number },
  prices: { type: Map, of: CurrencyPriceSchema, default: undefined },
  inventory: { type: Number, default: 0 },
  options: { type: Schema.Types.Mixed, default: {} },
})

const GalleryItemSchema = new Schema<IGalleryItem>({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  order: { type: Number, default: 0 },
})

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    originalPrice: { type: Number },
    salePrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    prices: { type: Map, of: CurrencyPriceSchema, default: undefined },
    weight: { type: Number },
    sku: { type: String, required: true, unique: true },
    inventory: { type: Number },
    trackInventory: { type: Boolean, default: false },
    gallery: [GalleryItemSchema],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    variants: [ProductVariantSchema],
    stickerId: { type: Schema.Types.ObjectId, ref: "Sticker" },
    sizeChartId: { type: Schema.Types.ObjectId, ref: "SizeChart" },
    status: { type: String, enum: ["active", "draft", "archived"], default: "draft" },
  },
  { timestamps: true }
)

ProductSchema.index({ name: "text", description: "text" })
ProductSchema.index({ slug: 1 })
ProductSchema.index({ collections: 1 })
ProductSchema.index({ status: 1 })

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export async function getProductsBySlugs(slugs: string[]): Promise<IProduct[]> {
  return Product.find({ slug: { $in: slugs } }).lean()
}
