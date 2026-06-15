"use client"

import { useState, useRef, Fragment } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X, Check, Wand2, AlertCircle } from "lucide-react"
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
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from "@/lib/currency"
import { formatPriceInput } from "./ProductForm.utils"
import type { ProductOption } from "./ProductForm.utils"
import type { IProductVariant } from "@/lib/db/models/Product"

interface TemplateOption {
  _id?: string
  name: string
  options: { name: string; values: string[] }[]
}

interface VariantsSectionProps {
  options: ProductOption[]
  variants: IProductVariant[]
  selectedVariants: Set<number>
  bulkPrice: string
  bulkInventory: string
  expandedVariant: number | null
  currency: string
  supportedCurrencies: string[]
  sku: string
  templates: TemplateOption[]
  loadedTemplateId: string | null
  onLoadTemplate: (template: TemplateOption) => void
  onSaveAsTemplate: () => void
  onClearTemplate: () => void
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onOptionNameChange: (index: number, name: string) => void
  onOptionValuesChange: (index: number, values: string) => void
  onVariantFieldChange: (index: number, field: keyof IProductVariant, value: string | number) => void
  onVariantPriceChange: (index: number, currencyCode: string, salePrice: string, originalPrice: string) => void
  onBulkApply: () => void
  onDuplicateVariant: (index: number) => void
  onDeleteVariant: (index: number) => void
  setSelectedVariants: React.Dispatch<React.SetStateAction<Set<number>>>
  setBulkPrice: React.Dispatch<React.SetStateAction<string>>
  setBulkInventory: React.Dispatch<React.SetStateAction<string>>
  setExpandedVariant: (index: number | null) => void
  setVariants: React.Dispatch<React.SetStateAction<IProductVariant[]>>
}

// ─── Tag Input for option values ───────────────────────────────────────────
function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && values.length > 0) {
      removeTag(values[values.length - 1])
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border border-border rounded-md bg-background min-h-[38px] cursor-text focus-within:ring-1 focus-within:ring-accent/40 focus-within:border-accent/60 transition-colors"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {values.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            className="text-accent/60 hover:text-accent transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={values.length === 0 ? placeholder : "Add value..."}
        className="flex-1 min-w-[80px] text-xs bg-transparent outline-none placeholder:text-muted"
      />
    </div>
  )
}

// ─── Bulk action bar ────────────────────────────────────────────────────────
function BulkBar({
  count,
  total,
  bulkPrice,
  bulkInventory,
  currency,
  onBulkApply,
  onSelectAll,
  onClear,
  setBulkPrice,
  setBulkInventory,
}: {
  count: number
  total: number
  bulkPrice: string
  bulkInventory: string
  currency: string
  onBulkApply: () => void
  onSelectAll: () => void
  onClear: () => void
  setBulkPrice: (v: string) => void
  setBulkInventory: (v: string) => void
}) {
  const sym = getCurrencySymbol(currency)

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
      <div className="flex items-center gap-2 mr-2">
        <span className="text-xs font-semibold text-accent tabular-nums">
          {count} of {total} selected
        </span>
        {count < total && (
          <button type="button" onClick={onSelectAll} className="text-[11px] text-accent/70 hover:text-accent underline">
            Select all
          </button>
        )}
        <button type="button" onClick={onClear} className="text-[11px] text-muted hover:text-secondary underline">
          Clear
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted">{sym}</span>
          <Input
            type="text"
            inputMode="decimal"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            placeholder="Price"
            className="h-7 text-xs w-24 pl-6 sm:pl-7"
          />
        </div>
        <Input
          type="text"
          inputMode="numeric"
          value={bulkInventory}
          onChange={(e) => setBulkInventory(e.target.value)}
          placeholder="Qty"
          className="h-7 text-xs w-20"
        />
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onBulkApply}
          disabled={!bulkPrice && !bulkInventory}
        >
          <Check className="h-3 w-3" />
          Apply to {count}
        </Button>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export function VariantsSection({
  options,
  variants,
  selectedVariants,
  bulkPrice,
  bulkInventory,
  expandedVariant,
  currency,
  supportedCurrencies,
  sku,
  templates,
  loadedTemplateId,
  onLoadTemplate,
  onSaveAsTemplate,
  onClearTemplate,
  onAddOption,
  onRemoveOption,
  onOptionNameChange,
  onOptionValuesChange,
  onVariantFieldChange,
  onVariantPriceChange,
  onBulkApply,
  onDuplicateVariant,
  onDeleteVariant,
  setSelectedVariants,
  setBulkPrice,
  setBulkInventory,
  setExpandedVariant,
  setVariants,
}: VariantsSectionProps) {
  const allSelected = variants.length > 0 && selectedVariants.size === variants.length

  // Derive tag values from either raw input or committed option values
  const getTagValues = (i: number) => options[i]?.values ?? []

  const handleTagChange = (i: number, values: string[]) => {
    onOptionValuesChange(i, values.join(", "))
  }

  return (
    <div className="space-y-4 relative">

      {/* ── Template row ─────────────────────────────────────── */}
      {templates.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            value={loadedTemplateId || "none"}
            onValueChange={(val) => {
              if (val === "none") onClearTemplate()
              else {
                const t = templates.find((t) => t._id === val)
                if (t) onLoadTemplate(t)
              }
            }}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Load a template…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No template</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t._id} value={t._id || ""}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onSaveAsTemplate} disabled={options.length === 0}>
            <Save className="h-3 w-3 mr-1" /> Save template
          </Button>

          {loadedTemplateId && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClearTemplate}>
              <X className="h-3.5 w-3.5 text-muted" />
            </Button>
          )}
        </div>
      )}

      {/* ── Options ──────────────────────────────────────────── */}
      <div className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="grid grid-cols-[130px_1fr_auto] gap-2 items-start">
            <Input
              value={option.name}
              onChange={(e) => onOptionNameChange(i, e.target.value)}
              placeholder="e.g. Size"
              className="h-9 text-xs"
            />
            <TagInput
              values={getTagValues(i)}
              onChange={(vals) => handleTagChange(i, vals)}
              placeholder="Type a value, press Enter or comma"
            />
            <button
              type="button"
              onClick={() => onRemoveOption(i)}
              className="mt-1 p-1.5 text-muted hover:text-danger rounded transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs mt-1" onClick={onAddOption}>
          <Plus className="h-3 w-3 mr-1" /> Add option
        </Button>
      </div>

      {/* ── Variants table ───────────────────────────────────── */}
      {variants.length > 0 && (
        <div className="space-y-2">
          {/* Bulk bar – always visible when variants exist */}
          <BulkBar
            count={selectedVariants.size}
            total={variants.length}
            bulkPrice={bulkPrice}
            bulkInventory={bulkInventory}
            currency={currency}
            onBulkApply={onBulkApply}
            onSelectAll={() => setSelectedVariants(new Set(variants.map((_, i) => i)))}
            onClear={() => setSelectedVariants(new Set())}
            setBulkPrice={setBulkPrice}
            setBulkInventory={setBulkInventory}
          />

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-background-subtle border-b border-border">
                  <th className="w-8 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelectedVariants(allSelected ? new Set() : new Set(variants.map((_, i) => i)))
                      }
                      className="rounded accent-accent"
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-secondary">Variant</th>
                  <th className="px-3 py-2 text-left font-semibold text-secondary w-36">Price</th>
                  <th className="px-3 py-2 text-left font-semibold text-secondary w-36">Compare-at</th>
                  <th className="px-3 py-2 text-left font-semibold text-secondary w-24">Qty</th>
                  <th className="px-3 py-2 text-left font-semibold text-secondary w-36">SKU</th>
                  <th className="w-16 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, i) => (
                  <Fragment key={i}>
                    <tr
                      className={`border-b border-border last:border-0 transition-colors ${
                        selectedVariants.has(i) ? "bg-accent/5" : "hover:bg-background-subtle/40"
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedVariants.has(i)}
                          onChange={() => {
                            const next = new Set(selectedVariants)
                            next.has(i) ? next.delete(i) : next.add(i)
                            setSelectedVariants(next)
                          }}
                          className="rounded accent-accent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-foreground">{variant.name}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted">
                            {getCurrencySymbol(currency)}
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={variant.price != null ? String(variant.price) : ""}
                            onChange={(e) => onVariantFieldChange(i, "price", e.target.value.replace(/,/g, "") || 0)}
                            onBlur={(e) => onVariantFieldChange(i, "price", formatPriceInput(e.target.value.replace(/,/g, "")) || 0)}
                            className="h-7 text-xs pl-6 sm:pl-8 w-full"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted">
                            {getCurrencySymbol(currency)}
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={variant.compareAt != null ? String(variant.compareAt) : ""}
                            onChange={(e) => onVariantFieldChange(i, "compareAt", e.target.value.replace(/,/g, "") || 0)}
                            onBlur={(e) => {
                              const v = e.target.value.replace(/,/g, "")
                              onVariantFieldChange(i, "compareAt", v ? parseFloat(formatPriceInput(v)) : 0)
                            }}
                            className="h-7 text-xs pl-6 sm:pl-8 w-full"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={variant.inventory ?? ""}
                          onChange={(e) => onVariantFieldChange(i, "inventory", parseInt(e.target.value) || 0)}
                          className="h-7 text-xs w-full"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={variant.sku}
                          onChange={(e) => onVariantFieldChange(i, "sku", e.target.value)}
                          className="h-7 text-xs font-mono w-full"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-0.5 justify-end">
                          {/* Only show expand toggle if there are additional currencies */}
                          {supportedCurrencies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setExpandedVariant(expandedVariant === i ? null : i)}
                              title="Multi-currency prices"
                              className="p-1 text-muted hover:text-secondary rounded transition-colors"
                            >
                              {expandedVariant === i
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronDown className="h-3.5 w-3.5" />
                              }
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteVariant(i)}
                            className="p-1 text-muted hover:text-danger rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded multi-currency row */}
                    {expandedVariant === i && supportedCurrencies.length > 1 && (
                      <tr key={`${i}-expanded`} className="bg-background-subtle/60 border-b border-border">
                        <td colSpan={7} className="px-4 py-3">
                          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
                            Additional currency prices
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {supportedCurrencies.filter((c) => c !== currency).map((code) => {
                              const sym = getCurrencySymbol(code)
                              const conf = SUPPORTED_CURRENCIES[code]
                              const p = (variant.prices || {})[code] || { salePrice: "", originalPrice: "" }
                              return (
                                <div key={code} className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
                                  <span className="text-[11px] font-semibold text-accent w-8">{code}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted">{sym}</span>
                                      <Input
                                        type="text"
                                        inputMode="decimal"
                                        step={conf?.decimalPlaces === 0 ? "1" : "0.01"}
                                        value={p.salePrice ?? ""}
                                        onChange={(e) => onVariantPriceChange(i, code, e.target.value.replace(/,/g, ""), String(p.originalPrice ?? ""))}
                                        className="h-7 text-xs w-20 pl-5"
                                        placeholder="Price"
                                      />
                                    </div>
                                    <span className="text-muted text-[10px]">/</span>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted">{sym}</span>
                                      <Input
                                        type="text"
                                        inputMode="decimal"
                                        step={conf?.decimalPlaces === 0 ? "1" : "0.01"}
                                        value={p.originalPrice ?? ""}
                                        onChange={(e) => onVariantPriceChange(i, code, String(p.salePrice ?? ""), e.target.value.replace(/,/g, ""))}
                                        className="h-7 text-xs w-20 pl-5"
                                        placeholder="Compare"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted">
            {variants.length} variant{variants.length !== 1 ? "s" : ""} · Select any row to bulk-edit price or quantity
          </p>
        </div>
      )}
    </div>
  )
}