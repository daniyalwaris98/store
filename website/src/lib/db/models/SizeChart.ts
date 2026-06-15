import mongoose, { Schema, type Document } from "mongoose"

export interface ISizeChartRow {
  size: string
  measurements: string[]
}

export interface ISizeChart extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  images: string[]
  columns: string[]
  rows: ISizeChartRow[]
  allowCustomSize: boolean
  customSizeFields: string[]
  isActive: boolean
  createdAt: Date
}

const SizeChartRowSchema = new Schema<ISizeChartRow>({
  size: { type: String, required: true },
  measurements: [{ type: String, required: true }],
})

const SizeChartSchema = new Schema<ISizeChart>(
  {
    name: { type: String, required: true },
    images: [{ type: String }],
    columns: [{ type: String, required: true }],
    rows: [SizeChartRowSchema],
    allowCustomSize: { type: Boolean, default: false },
    customSizeFields: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const SizeChart = mongoose.models.SizeChart || mongoose.model<ISizeChart>("SizeChart", SizeChartSchema)
