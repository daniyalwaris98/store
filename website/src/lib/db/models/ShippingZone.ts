import mongoose, { Schema, type Document } from "mongoose"

export interface IShippingRate {
  name: string
  price: number
  perKg: number
  freeShipping: boolean
  freeAbove?: number
  weightAbove?: number
}

export interface IShippingZone extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  countries: string[]
  rates: IShippingRate[]
  handlingFee: number
  status: "active" | "inactive"
}

const ShippingRateSchema = new Schema<IShippingRate>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  perKg: { type: Number, default: 0 },
  freeShipping: { type: Boolean, default: false },
  freeAbove: { type: Number },
  weightAbove: { type: Number },
})

const ShippingZoneSchema = new Schema<IShippingZone>(
  {
    name: { type: String, required: true },
    countries: [{ type: String, required: true }],
    rates: [ShippingRateSchema],
    handlingFee: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
)

ShippingZoneSchema.index({ countries: 1 })
ShippingZoneSchema.index({ status: 1 })

export const ShippingZone = mongoose.models.ShippingZone || mongoose.model<IShippingZone>("ShippingZone", ShippingZoneSchema)
