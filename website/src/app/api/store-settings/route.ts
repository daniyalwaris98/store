import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { StoreSettings, getStoreSettings } from "@/lib/db/models/StoreSettings"
import { CURRENCY_CODES } from "@/lib/currency"

/**
 * GET /api/store-settings — public endpoint to fetch store settings
 */
export async function GET() {
  try {
    await connectDB()
    const settings = await getStoreSettings()
    return NextResponse.json({
      defaultCurrency: settings.defaultCurrency,
      supportedCurrencies: settings.supportedCurrencies,
    })
  } catch (error) {
    console.error("Failed to fetch store settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch store settings" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/store-settings — admin endpoint to update store settings
 */
export async function PUT(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    const { defaultCurrency, supportedCurrencies } = body

    // Validate currency codes
    if (defaultCurrency && !CURRENCY_CODES.includes(defaultCurrency)) {
      return NextResponse.json(
        { error: `Invalid currency: ${defaultCurrency}. Supported: ${CURRENCY_CODES.join(", ")}` },
        { status: 400 }
      )
    }

    if (supportedCurrencies) {
      const invalid = supportedCurrencies.filter((c: string) => !CURRENCY_CODES.includes(c))
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid currencies: ${invalid.join(", ")}` },
          { status: 400 }
        )
      }

      // Default currency must be in the supported list
      const effectiveDefault = defaultCurrency || (await getStoreSettings()).defaultCurrency
      if (!supportedCurrencies.includes(effectiveDefault)) {
        return NextResponse.json(
          { error: "Default currency must be included in supported currencies" },
          { status: 400 }
        )
      }
    }

    const settings = await getStoreSettings()
    if (defaultCurrency) settings.defaultCurrency = defaultCurrency
    if (supportedCurrencies) settings.supportedCurrencies = supportedCurrencies
    await settings.save()

    return NextResponse.json({
      defaultCurrency: settings.defaultCurrency,
      supportedCurrencies: settings.supportedCurrencies,
    })
  } catch (error) {
    console.error("Failed to update store settings:", error)
    return NextResponse.json(
      { error: "Failed to update store settings" },
      { status: 500 }
    )
  }
}
