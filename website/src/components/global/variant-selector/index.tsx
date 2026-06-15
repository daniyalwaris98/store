"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ProductVariant } from "@/types/product"

interface VariantSelectorProps {
  variants: ProductVariant[]
  onVariantChange?: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const initialOptions = variants[0]?.options || {}
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({ ...initialOptions })

  // Initialize with first variant on mount
  useEffect(() => {
    if (variants[0]) {
      onVariantChange?.(variants[0])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!variants || variants.length === 0) return null

  const optionKeys = Object.keys(variants[0]?.options || {})

  const handleOptionSelect = (optionKey: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionKey]: value }
    setSelectedOptions(newOptions)
    const match = findMatchingVariant(newOptions)
    if (match) {
      onVariantChange?.(match)
    }
  }

  const findMatchingVariant = (options: Record<string, string>): ProductVariant | undefined => {
    // If options has fewer keys than optionKeys, it's a partial match - return first matching variant
    if (Object.keys(options).length < optionKeys.length) {
      return variants.find((variant) =>
        Object.keys(options).every((key) => variant.options[key] === options[key])
      )
    }
    // Full match when all option keys are selected
    return variants.find((variant) =>
      optionKeys.every((key) => variant.options[key] === options[key])
    )
  }

  const getAvailableValues = (optionKey: string): string[] => {
    const uniqueValues = new Set<string>()
    variants.forEach((v) => {
      if (v.options[optionKey]) uniqueValues.add(v.options[optionKey])
    })
    return Array.from(uniqueValues)
  }

  const isValueAvailable = (optionKey: string, value: string): boolean => {
    const testOptions = { ...selectedOptions, [optionKey]: value }

    // Get option keys that are actually selected (excluding current)
    const otherSelectedKeys = optionKeys.filter(
      (key) => key !== optionKey && key in selectedOptions
    )

    // If no other options are selected yet, any variant with this value is available
    if (otherSelectedKeys.length === 0) {
      return variants.some((variant) => variant.options[optionKey] === value)
    }

    // Check if there's a variant matching all selected options including this value
    return variants.some((variant) =>
      optionKeys.every((key) => variant.options[key] === testOptions[key])
    )
  }

  if (optionKeys.length === 0) return null

  return (
    <div className="space-y-4">
      {optionKeys.map((optionKey) => (
        <div key={optionKey} className="space-y-2">
          <label className="text-sm font-medium capitalize">{optionKey}</label>
          <div className="flex flex-wrap gap-2">
            {getAvailableValues(optionKey).map((value) => {
              const isSelected = selectedOptions[optionKey] === value
              const isAvailable = isValueAvailable(optionKey, value)
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleOptionSelect(optionKey, value)}
                  className={cn(
                    !isAvailable && "opacity-50 cursor-not-allowed line-through"
                  )}
                >
                  {value}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}