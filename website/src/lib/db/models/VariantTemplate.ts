import mongoose, { Schema, type Document } from "mongoose"

export interface IVariantTemplateOption {
  name: string
  values: string[]
}

export interface IVariantTemplate extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  options: IVariantTemplateOption[]
  createdAt: Date
  updatedAt: Date
}

const VariantTemplateOptionSchema = new Schema<IVariantTemplateOption>({
  name: { type: String, required: true },
  values: { type: [String], required: true },
}, { _id: false })

const VariantTemplateSchema = new Schema<IVariantTemplate>(
  {
    name: { type: String, required: true },
    options: { type: [VariantTemplateOptionSchema], required: true },
  },
  { timestamps: true }
)

VariantTemplateSchema.index({ name: 1 })

export const VariantTemplate = mongoose.models.VariantTemplate || mongoose.model<IVariantTemplate>("VariantTemplate", VariantTemplateSchema)