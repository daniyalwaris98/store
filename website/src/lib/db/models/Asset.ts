import mongoose, { Schema, type Document } from "mongoose"

export interface IAsset extends Document {
  _id: mongoose.Types.ObjectId
  publicId: string
  url: string
  type: "image" | "video" | "file"
  folder: string
  createdAt: Date
}

const AssetSchema = new Schema<IAsset>(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "file"], default: "file" },
    folder: { type: String, default: "misc" },
  },
  { timestamps: true }
)

AssetSchema.index({ url: 1 })

export const Asset = mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema)