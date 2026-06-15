// ============================================================================
// CURRENCY CONFIGURATION
// ============================================================================

export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
  locale: string
  decimalPlaces: number
}

/**
 * All supported currencies.
 * Add new currencies here — the rest of the system will pick them up automatically.
 */
export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
    decimalPlaces: 2,
  },
  PKR: {
    code: "PKR",
    name: "Pakistani Rupee",
    symbol: "Rs",
    locale: "en-PK",
    decimalPlaces: 0,
  },
}

export const DEFAULT_CURRENCY = "USD"

export const CURRENCY_CODES = Object.keys(SUPPORTED_CURRENCIES)

/**
 * Get the symbol prefix for a currency (used in form inputs).
 */
export function getCurrencySymbol(currencyCode: string): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode
}

/**
 * Get the full config for a currency code.
 */
export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
}

/**
 * Format an amount for a given currency using Intl.NumberFormat.
 */
export function formatPrice(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode)
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(amount)
}

/**
 * Given a product's prices map and a currency code, resolve the best price to show.
 * Falls back to the product's base salePrice/originalPrice if the requested currency isn't available.
 */
export function resolveProductPrice(
  product: {
    salePrice: number
    originalPrice?: number
    currency: string
    prices?: Record<string, { salePrice: number; originalPrice?: number }>
  },
  targetCurrency: string
): { salePrice: number; originalPrice?: number; currency: string } {
  // If the target currency matches the product's base currency, use the base prices
  if (targetCurrency === product.currency) {
    return {
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      currency: product.currency,
    }
  }

  // Check if the product has a price entry for the target currency
  if (product.prices?.[targetCurrency]) {
    return {
      salePrice: product.prices[targetCurrency].salePrice,
      originalPrice: product.prices[targetCurrency].originalPrice,
      currency: targetCurrency,
    }
  }

  // Fallback: return the base price with the product's original currency
  return {
    salePrice: product.salePrice,
    originalPrice: product.originalPrice,
    currency: product.currency,
  }
}
