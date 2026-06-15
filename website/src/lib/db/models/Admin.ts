import mongoose, { Schema, type Document } from "mongoose"

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  name: string
  isActive: boolean
  createdAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)
