import mongoose, { Schema, type Document } from "mongoose"

export interface IStoreSettings extends Document {
  _id: mongoose.Types.ObjectId
  /** The default currency used for product base prices and new products */
  defaultCurrency: string
  /** List of currency codes that the store supports (customers can switch between these) */
  supportedCurrencies: string[]
  updatedAt: Date
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    defaultCurrency: { type: String, default: "USD" },
    supportedCurrencies: { type: [String], default: ["USD"] },
  },
  { timestamps: true }
)

export const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema)

/**
 * Get the store settings singleton. Creates default settings if none exist.
 */
export async function getStoreSettings(): Promise<IStoreSettings> {
  let settings = await StoreSettings.findOne()
  if (!settings) {
    settings = await StoreSettings.create({
      defaultCurrency: "USD",
      supportedCurrencies: ["USD"],
    })
  }
  return settings
}
