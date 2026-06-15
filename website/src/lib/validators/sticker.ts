import { z } from "zod"

export const createStickerSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
  placement: z.enum([
    "top-left",
    "top-right",
    "top-center",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-right",
    "bottom-center",
  ]),
  isActive: z.boolean().default(true),
})

export const updateStickerSchema = createStickerSchema.partial()

export type CreateStickerInput = z.infer<typeof createStickerSchema>
export type UpdateStickerInput = z.infer<typeof updateStickerSchema>
