import type { CreateProductInput, UpdateProductInput } from "@/lib/validators/product"
import type { IProductVariant, IGalleryItem, IProduct } from "@/lib/db/models/Product"
import type { ProductOption } from "./ProductForm.utils"

export interface ProductFormProps {
  mode: "create" | "edit"
  productId?: string
}

export interface ProductFormState {
  name: string
  slug: string
  description: string
  slugManual: boolean
  salePrice: string
  originalPrice: string
  currency: string
  prices: Record<string, { salePrice: string; originalPrice: string }>
  supportedCurrencies: string[]
  sku: string
  inventory: string
  trackInventory: boolean
  weight: string
  status: "active" | "draft" | "archived"
  selectedCollections: string[]
  stickerId: string
  sizeChartId: string
  gallery: IGalleryItem[]
  options: ProductOption[]
  variants: IProductVariant[]
  optionValuesRaw: Record<number, string>
}

export type { CreateProductInput, UpdateProductInput, IProduct, IGalleryItem, IProductVariant }