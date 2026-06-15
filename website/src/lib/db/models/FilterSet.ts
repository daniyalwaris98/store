import mongoose, { Schema, type Document } from "mongoose"

export interface IFilterSet extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  type: "select" | "multiselect" | "range"
  options?: string[]
  rangeMin?: number
  rangeMax?: number
  rangeStep?: number
  isActive: boolean
  createdAt: Date
}

const FilterSetSchema = new Schema<IFilterSet>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ["select", "multiselect", "range"], required: true },
    options: [{ type: String }],
    rangeMin: { type: Number },
    rangeMax: { type: Number },
    rangeStep: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

FilterSetSchema.index({ slug: 1 })
FilterSetSchema.index({ isActive: 1 })

export const FilterSet = mongoose.models.FilterSet || mongoose.model<IFilterSet>("FilterSet", FilterSetSchema)
