import { z } from "zod"

export const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export const addressSchema = z.object({
  label: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
})

export const createCustomerSchema = customerSchema.extend({
  addresses: z.array(addressSchema).optional(),
})

export const updateCustomerSchema = customerSchema.partial()

export const customerQuerySchema = z.object({
  search: z.string().nullable().optional(),
  page: z.union([z.coerce.number().int().positive(), z.literal(""), z.literal("null")]).optional().transform((v) => v === "" || v === "null" ? undefined : v).default(1),
  limit: z.union([z.coerce.number().int().positive().max(100), z.literal(""), z.literal("null")]).optional().transform((v) => v === "" || v === "null" ? undefined : v).default(20),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
