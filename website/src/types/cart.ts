export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  image?: string
  sku?: string
  customMeasurements?: Record<string, string>
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  totalItems: number
}

export interface AddToCartInput {
  productId: string
  variantId?: string
  quantity?: number
  currency?: string
}

export interface UpdateCartInput {
  itemId: string
  quantity: number
}

export interface RemoveFromCartInput {
  itemId: string
}

export interface DirectBuyInput {
  productId: string
  variantId?: string
  quantity?: number
  currency?: string
}