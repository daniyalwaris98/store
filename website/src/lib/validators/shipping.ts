import { z } from "zod"

export const shippingRateSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  perKg: z.number().min(0).default(0),
  freeShipping: z.boolean().default(false),
  freeAbove: z.number().nullable().optional(),
  weightAbove: z.number().nullable().optional(),
})

export const createShippingZoneSchema = z.object({
  name: z.string().min(1),
  countries: z.array(z.string()).min(1),
  rates: z.array(shippingRateSchema).min(1),
  handlingFee: z.number().min(0).default(0),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const updateShippingZoneSchema = createShippingZoneSchema.partial()

export const calculateShippingSchema = z.object({
  country: z.string().min(2).max(3),
  weight: z.number().min(0).optional(),
  subtotal: z.number().min(0).optional(),
})

export type ShippingRate = z.infer<typeof shippingRateSchema>
export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>
export type UpdateShippingZoneInput = z.infer<typeof updateShippingZoneSchema>
export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>
