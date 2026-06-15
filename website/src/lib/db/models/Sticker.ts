import mongoose, { Schema, type Document } from "mongoose"

export type StickerPlacement =
  | "top-left"
  | "top-right"
  | "top-center"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"

export interface ISticker extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  imageUrl: string
  placement: StickerPlacement
  isActive: boolean
  createdAt: Date
}

const StickerSchema = new Schema<ISticker>(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    placement: {
      type: String,
      enum: [
        "top-left",
        "top-right",
        "top-center",
        "center-left",
        "center",
        "center-right",
        "bottom-left",
        "bottom-right",
        "bottom-center",
      ],
      default: "top-right",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Sticker = mongoose.models.Sticker || mongoose.model<ISticker>("Sticker", StickerSchema)
