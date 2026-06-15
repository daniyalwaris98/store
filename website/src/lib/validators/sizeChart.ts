import { z } from "zod"

export const sizeChartRowSchema = z.object({
  size: z.string().min(1),
  measurements: z.array(z.string()),
})

export const createSizeChartSchema = z.object({
  name: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  columns: z.array(z.string()).min(1),
  rows: z.array(sizeChartRowSchema).min(1),
  allowCustomSize: z.boolean().default(false),
  customSizeFields: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

export const updateSizeChartSchema = z.object({
  name: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  columns: z.array(z.string()).min(1).optional(),
  rows: z.array(sizeChartRowSchema).min(1).optional(),
  allowCustomSize: z.boolean().optional(),
  customSizeFields: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type SizeChartRow = z.infer<typeof sizeChartRowSchema>
export type CreateSizeChartInput = z.infer<typeof createSizeChartSchema>
export type UpdateSizeChartInput = z.infer<typeof updateSizeChartSchema>
