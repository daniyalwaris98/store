import { z } from "zod"

export const createReviewSchema = z.object({
  productId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
})

export const reviewQuerySchema = z.object({
  productId: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
})

export const reviewActionSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
})

export const adminCreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
  customer: z.string().min(1).max(100).optional(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(true),
  status: z.enum(["pending", "approved", "rejected"]).default("approved"),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>
export type ReviewActionInput = z.infer<typeof reviewActionSchema>
