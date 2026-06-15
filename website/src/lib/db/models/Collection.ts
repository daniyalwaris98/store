import mongoose, { Schema, type Document } from "mongoose"

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  parent?: mongoose.Types.ObjectId
  order: number
  image?: string
  filters: string[]
  status: "active" | "archived"
  showInMenu: boolean
  createdAt: Date
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Collection" },
    order: { type: Number, default: 0 },
    image: { type: String },
    filters: [{ type: String }],
    status: { type: String, enum: ["active", "archived"], default: "active" },
    showInMenu: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CollectionSchema.index({ slug: 1 })
CollectionSchema.index({ parent: 1 })
CollectionSchema.index({ status: 1 })

export const Collection = mongoose.models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema)
