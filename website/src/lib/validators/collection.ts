import { z } from "zod"

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
  parent: z.string().optional(),
  order: z.number().int().min(0).default(0),
  image: z.string().url().optional(),
  filters: z.array(z.string()).optional(),
  status: z.enum(["active", "archived"]).default("active"),
  showInMenu: z.boolean().default(true),
})

export const updateCollectionSchema = createCollectionSchema.partial()

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
