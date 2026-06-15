import mongoose, { Schema, type Document } from "mongoose"

export interface IAddress {
  label: string
  street: string
  city: string
  state?: string
  country: string
  postalCode?: string
}

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  name?: string
  phone?: string
  addresses: IAddress[]
  createdAt: Date
  lastLoginAt: Date
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: "Home" },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  postalCode: { type: String },
})

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    addresses: [AddressSchema],
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema)
