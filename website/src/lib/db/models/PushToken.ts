import mongoose, { Schema, Document } from "mongoose"

export interface IPushToken extends Document {
  email: string
  pushToken: string
  platform: "ios" | "android"
  createdAt: Date
  updatedAt: Date
}

const PushTokenSchema = new Schema<IPushToken>(
  {
    email: { type: String, required: true, index: true },
    pushToken: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android"], default: "android" },
  },
  { timestamps: true }
)

// One token per pushToken (each device installation has a unique token)
PushTokenSchema.index({ pushToken: 1 }, { unique: true })

export const PushToken = mongoose.models.PushToken || mongoose.model<IPushToken>("PushToken", PushTokenSchema)