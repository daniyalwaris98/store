import mongoose, { Schema, type Document } from "mongoose"

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  variantId?: string
  variantOptions?: Record<string, string>
  customMeasurements?: Record<string, string>
  sku: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface IStageHistory {
  stage: string
  note?: string
  timestamp: Date
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  orderNumber: string
  customer: mongoose.Types.ObjectId
  items: IOrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  currency: string
  country: string
  stage: "unpaid" | "processing" | "shipped" | "delivered"
  stageHistory: IStageHistory[]
  paymentMethod: "cod"
  paymentStatus: "unpaid" | "paid"
  fulfillmentStatus: "unfulfilled" | "partially_fulfilled" | "fulfilled"
  shippingAddress?: {
    street: string
    city: string
    state?: string
    country: string
    postalCode?: string
  }
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: String },
  variantOptions: { type: Schema.Types.Mixed },
  customMeasurements: { type: Schema.Types.Mixed },
  sku: { type: String, default: "" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
})

const StageHistorySchema = new Schema<IStageHistory>({
  stage: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    country: { type: String, required: true },
    stage: {
      type: String,
      enum: ["unpaid", "processing", "shipped", "delivered"],
      default: "unpaid",
    },
    stageHistory: [StageHistorySchema],
    paymentMethod: { type: String, enum: ["cod"], default: "cod" },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    fulfillmentStatus: {
      type: String,
      enum: ["unfulfilled", "partially_fulfilled", "fulfilled"],
      default: "unfulfilled",
    },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
  },
  { timestamps: true }
)

OrderSchema.index({ customer: 1 })
OrderSchema.index({ stage: 1 })
OrderSchema.index({ createdAt: -1 })

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
