import { z } from "zod"

export const createFilterSetSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["select", "multiselect", "range"]),
  options: z.array(z.string()).optional(),
  rangeMin: z.number().optional(),
  rangeMax: z.number().optional(),
  rangeStep: z.number().optional(),
  isActive: z.boolean().default(true),
})

export const updateFilterSetSchema = createFilterSetSchema.partial()

export type CreateFilterSetInput = z.infer<typeof createFilterSetSchema>
export type UpdateFilterSetInput = z.infer<typeof updateFilterSetSchema>
