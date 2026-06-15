import { z } from "zod"

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  currency: z.string().optional(),
})

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
})

export const removeFromCartSchema = z.object({
  itemId: z.string().min(1),
})

export const directBuySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  currency: z.string().optional(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
export type DirectBuyInput = z.infer<typeof directBuySchema>
