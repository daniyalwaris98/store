import mongoose, { Schema, type Document } from "mongoose"

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  product?: mongoose.Types.ObjectId
  customer?: mongoose.Types.ObjectId
  rating: number
  title: string
  body: string
  images: string[]
  verified: boolean
  helpful: number
  featured: boolean
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    customer: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    images: [{ type: String }],
    verified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
)

ReviewSchema.index({ product: 1 })
ReviewSchema.index({ customer: 1 })
ReviewSchema.index({ status: 1 })
ReviewSchema.index({ rating: -1 })

export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
