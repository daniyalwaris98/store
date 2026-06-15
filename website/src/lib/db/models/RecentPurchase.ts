import mongoose, { Schema, type Document } from "mongoose"

export interface IRecentPurchase extends Document {
  orderNumber: string
  customerName: string
  productName: string
  productImage?: string
  createdAt: Date
}

const RecentPurchaseSchema = new Schema<IRecentPurchase>(
  {
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
  },
  { timestamps: true }
)

RecentPurchaseSchema.index({}, { expireAfterSeconds: 86400 })

export const RecentPurchase =
  mongoose.models.RecentPurchase ||
  mongoose.model<IRecentPurchase>("RecentPurchase", RecentPurchaseSchema)