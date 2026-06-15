"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from "@/lib/currency"
import { formatPriceInput } from "./ProductForm.utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

interface PricingSectionProps {
  currency: string
  setCurrency: (v: string) => void
  salePrice: string
  setSalePrice: (v: string) => void
  originalPrice: string
  setOriginalPrice: (v: string) => void
  prices: Record<string, { salePrice: string; originalPrice: string }>
  setPrices: React.Dispatch<React.SetStateAction<Record<string, { salePrice: string; originalPrice: string }>>>
  supportedCurrencies: string[]
  margin: string | null
  originalPriceNum: number
  salePriceNum: number
  onApplyDiscount: (pct: number) => void
}

// ─── Discount Dialog ──────────────────────────────────────────────────────────
function DiscountDialog({ open, onOpenChange, onApply }: { open: boolean; onOpenChange: (v: boolean) => void; onApply: (pct: number) => void }) {
  const [pct, setPct] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setPct("")
    }
  }, [open])

  const handleApply = () => {
    const num = parseFloat(pct)
    if (isNaN(num) || num <= 0 || num >= 100) return
    onApply(num)
    setPct("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            Apply discount %
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted leading-relaxed">
          Auto-fills compare-at prices for the product and all variants across all currencies.
          <br />
          Formula: <span className="font-mono">compareAt = price × (1 + %/100)</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={pct}
              onChange={(e) => setPct(e.target.value.replace(/[^0-9.]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApply() } }}
              placeholder="e.g. 20"
              className="h-10 text-sm pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">%</span>
          </div>
          <Button
            type="button"
            size="default"
            onClick={handleApply}
            disabled={!pct || isNaN(parseFloat(pct)) || parseFloat(pct) <= 0}
          >
            <Check className="h-4 w-4" />
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PricingSection({
  currency,
  setCurrency,
  salePrice,
  setSalePrice,
  originalPrice,
  setOriginalPrice,
  prices,
  setPrices,
  supportedCurrencies,
  margin,
  originalPriceNum,
  salePriceNum,
  onApplyDiscount,
}: PricingSectionProps) {
  const [showOtherCurrencies, setShowOtherCurrencies] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const sym = getCurrencySymbol(currency)
  const otherCurrencies = supportedCurrencies.filter((c) => c !== currency)
  const filledOtherCount = otherCurrencies.filter((c) => prices[c]?.salePrice).length

  return (
    <div className="space-y-4">
      {/* Currency selector + Discount button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-xs text-secondary shrink-0">Base currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="h-8 text-xs w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((code) => (
              <SelectItem key={code} value={code}>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-background-muted px-1 rounded">{getCurrencySymbol(code)}</span>
                  {code}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 border-dashed"
          onClick={() => setDiscountOpen(true)}
          title="Apply a discount % to auto-fill compare-at prices"
        >
          Discount %
        </Button>

        <DiscountDialog open={discountOpen} onOpenChange={setDiscountOpen} onApply={onApplyDiscount} />
      </div>

      {/* Main price row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sale price */}
        <div className="space-y-1.5">
          <Label className="text-xs">Price ({currency}) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">{sym}</span>
            <Input
              type="text"
              inputMode="decimal"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value.replace(/,/g, ""))}
              onBlur={(e) => setSalePrice(formatPriceInput(e.target.value.replace(/,/g, "")))}
              className="h-9 text-sm pl-8 md:pl-8"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Compare-at */}
        <div className="space-y-1.5">
          <Label className="text-xs text-secondary">Compare-at</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">{sym}</span>
            <Input
              type="text"
              inputMode="decimal"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value.replace(/,/g, ""))}
              onBlur={(e) => setOriginalPrice(formatPriceInput(e.target.value.replace(/,/g, "")))}
              className="h-9 text-sm pl-8 md:pl-8"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Margin hint */}
      {margin && (
        <p className="text-[11px] text-success">
          {margin}% Off
        </p>
      )}

      {/* Other currencies — collapsed by default */}
      {otherCurrencies.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowOtherCurrencies((v) => !v)}
            className="flex items-center gap-2 text-xs text-secondary hover:text-foreground transition-colors"
          >
            {showOtherCurrencies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>
              Prices for other currencies
              {filledOtherCount > 0 && (
                <span className="ml-1.5 bg-accent/15 text-accent text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {filledOtherCount} set
                </span>
              )}
            </span>
          </button>

          {showOtherCurrencies && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-muted mb-3">
                Leave blank to use the base currency price for all regions.
              </p>
              {otherCurrencies.map((code) => {
                const s = getCurrencySymbol(code)
                const conf = SUPPORTED_CURRENCIES[code]
                const p = prices[code] || { salePrice: "", originalPrice: "" }
                return (
                  <div key={code} className="flex items-center gap-3 p-2.5 bg-background-subtle rounded-lg">
                    <span className="text-xs font-semibold w-10 text-secondary">{code}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted">{s}</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          step={conf?.decimalPlaces === 0 ? "1" : "0.01"}
                          value={p.salePrice}
                          onChange={(e) => setPrices((prev) => ({
                            ...prev,
                            [code]: { ...prev[code], salePrice: e.target.value.replace(/,/g, ""), originalPrice: prev[code]?.originalPrice || "" },
                          }))}
                          onBlur={(e) => setPrices((prev) => ({
                            ...prev,
                            [code]: { ...prev[code], salePrice: formatPriceInput(e.target.value.replace(/,/g, ""), conf?.decimalPlaces ?? 2) },
                          }))}
                          className="h-8 text-xs pl-7"
                          placeholder="Price"
                        />
                      </div>
                      <span className="text-muted text-[11px]">/</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted">{s}</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          step={conf?.decimalPlaces === 0 ? "1" : "0.01"}
                          value={p.originalPrice}
                          onChange={(e) => setPrices((prev) => ({
                            ...prev,
                            [code]: { salePrice: prev[code]?.salePrice || "", originalPrice: e.target.value.replace(/,/g, "") },
                          }))}
                          onBlur={(e) => setPrices((prev) => ({
                            ...prev,
                            [code]: { ...prev[code], originalPrice: formatPriceInput(e.target.value.replace(/,/g, ""), conf?.decimalPlaces ?? 2) },
                          }))}
                          className="h-8 text-xs pl-7"
                          placeholder="Compare-at"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}