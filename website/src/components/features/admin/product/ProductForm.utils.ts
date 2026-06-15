import type { IProductVariant } from "@/lib/db/models/Product"

// ============================================================================
// FORMATTING
// ============================================================================

export function formatPriceInput(value: string, decimalPlaces: number = 2): string {
  if (!value || value === "-") return value
  const num = parseFloat(value.replace(/,/g, ""))
  if (isNaN(num)) return value
  return num.toFixed(decimalPlaces)
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// ============================================================================
// VARIANT MATRIX GENERATOR
// ============================================================================

export interface ProductOption {
  name: string
  values: string[]
}

export function generateVariantMatrix(
  options: ProductOption[],
  existingVariants: IProductVariant[],
  baseSku: string,
  basePrice?: { salePrice: string; originalPrice: string; currency: string }
): IProductVariant[] {
  if (options.length === 0) return existingVariants

  const combinations: Record<string, string>[] = []

  function combine(index: number, current: Record<string, string>) {
    if (index === options.length) {
      combinations.push({ ...current })
      return
    }
    for (const value of options[index].values) {
      current[options[index].name] = value
      combine(index + 1, current)
    }
  }

  combine(0, {})

  return combinations.map((opts, idx) => {
    const name = Object.values(opts).join(" / ")
    const existingVariant = existingVariants.find(
      (v) => v.name === name || JSON.stringify(v.options) === JSON.stringify(opts)
    )
    if (existingVariant) return existingVariant

    const newVariant: IProductVariant = {
      sku: baseSku ? `${baseSku}-${idx + 1}` : "",
      name,
      price: 0,
      inventory: 0,
      options: opts,
    }

    if (basePrice?.salePrice) {
      newVariant.price = parseFloat(basePrice.salePrice)
    }
    if (basePrice?.originalPrice) {
      newVariant.compareAt = parseFloat(basePrice.originalPrice)
    }
    if (basePrice?.salePrice || basePrice?.originalPrice) {
      newVariant.prices = {
        [basePrice.currency]: {
          salePrice: basePrice.salePrice ? parseFloat(basePrice.salePrice) : 0,
          originalPrice: basePrice.originalPrice ? parseFloat(basePrice.originalPrice) : undefined,
        },
      }
    }

    return newVariant
  })
}