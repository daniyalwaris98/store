import { z } from "zod"

export const orderItemSchema = z.object({
  product: z.string(),
  variantId: z.string().optional(),
  variantOptions: z.record(z.string(), z.string()).optional(),
  customMeasurements: z.record(z.string(), z.string()).optional(),
  sku: z.string(),
  name: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  image: z.string().optional(),
})

export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(2).max(3),
  postalCode: z.string().optional(),
})

// Pakistani phone number validation
// Supports: +923168104861 (international) or 03168104861 (local with leading 0)
const phoneRegex = /^(\+92|0)[0-9]{10}$/

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  customerInfo: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    phone: z.string().regex(phoneRegex, "Enter a valid phone number (e.g., +92 300 1234567 or 03001234567)"),
  }),
  shippingAddress: addressSchema,
  shippingMethodId: z.string(),
  paymentMethod: z.enum(["cod"]),
  currency: z.string().min(1),
})

export const updateOrderStageSchema = z.object({
  stage: z.enum(["unpaid", "processing", "shipped", "delivered"]),
  note: z.string().optional(),
})

export const orderQuerySchema = z.object({
  status: z.enum(["unpaid", "paid"]).optional(),
  stage: z.enum(["unpaid", "processing", "shipped", "delivered"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  customerEmail: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type OrderItem = z.infer<typeof orderItemSchema>
export type Address = z.infer<typeof addressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStageInput = z.infer<typeof updateOrderStageSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>
