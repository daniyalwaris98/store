"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Save, ArrowLeft, Plus, Upload, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminProducts, useAdminCollections, useAdminStickers, useAdminSizeCharts } from "@/hooks"
import { useToast } from "@/context/ToastContext"
import axios from "axios"
import { MarkdownEditor } from "@/components/ui/editor/MarkdownEditor"
import { SectionCard } from "./ProductForm.components"
import { generateSlug, generateVariantMatrix, type ProductOption } from "./ProductForm.utils"
import { MediaSection, useMediaUpload } from "./ProductForm.media"
import { PricingSection } from "./ProductForm.pricing"
import { VariantsSection } from "./ProductForm.variants"
import { SeoSection } from "./ProductForm.seo"
import { SidebarSection } from "./ProductForm.sidebar"
import type { ProductFormProps } from "./ProductForm.types"
import type { CreateProductInput, UpdateProductInput } from "@/lib/validators/product"
import type { IProductVariant, IGalleryItem, IProduct } from "@/lib/db/models/Product"

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter()
  const { createProduct, updateProduct, isLoading } = useAdminProducts()
  const { collections, fetchCollections } = useAdminCollections()
  const { stickers, fetchStickers } = useAdminStickers()
  const { sizeCharts, fetchSizeCharts } = useAdminSizeCharts()
  const toast = useToast()

  // Loading state for edit mode
  const [isLoadingProduct, setIsLoadingProduct] = useState(mode === "edit")
  const [isSaving, setIsSaving] = useState(false)

  // Core product data
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [slugManual, setSlugManual] = useState(false)

  // Pricing
  const [salePrice, setSalePrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [prices, setPrices] = useState<Record<string, { salePrice: string; originalPrice: string }>>({})
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>(["USD", "PKR"])

  // Inventory
  const [sku, setSku] = useState("")
  const [inventory, setInventory] = useState("")
  const [trackInventory, setTrackInventory] = useState(false)
  const [weight, setWeight] = useState("")

  // Status & Organization
  const [status, setStatus] = useState<"active" | "draft" | "archived">("draft")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [stickerId, setStickerId] = useState("")
  const [sizeChartId, setSizeChartId] = useState("")

  // Media
  const [gallery, setGallery] = useState<IGalleryItem[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItem = useRef<number | null>(null)

  // Variants
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<IProductVariant[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set())
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkInventory, setBulkInventory] = useState("")
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null)
  const [templates, setTemplates] = useState<{ _id?: string; name: string; options: { name: string; values: string[] }[] }[]>([])
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null)

  // Error
  const [error, setError] = useState("")

  // ---- Fetch data ----
  useEffect(() => {
    fetchCollections()
    fetchStickers()
    fetchSizeCharts()
    axios.get("/api/store-settings").then(({ data }) => {
      setSupportedCurrencies(data.supportedCurrencies || ["USD"])
      if (mode === "create") {
        setCurrency(data.defaultCurrency || "USD")
      }
    }).catch(() => {})
    axios.get("/api/variant-templates").then(({ data }) => {
      setTemplates(data)
    }).catch(() => {})
  }, [fetchCollections, fetchStickers, fetchSizeCharts, mode])

  // ---- Load product for edit ----
  useEffect(() => {
    if (mode !== "edit" || !productId) return

    const loadProduct = async () => {
      try {
        const { data } = await axios.get<IProduct>(`/api/products/${productId}`)
        setName(data.name || "")
        setSlug(data.slug || "")
        setDescription(data.description || "")
        setSalePrice(data.salePrice?.toString() || "")
        setOriginalPrice(data.originalPrice?.toString() || "")
        setCurrency(data.currency || "USD")
        if (data.prices) {
          const pricesObj: Record<string, { salePrice: string; originalPrice: string }> = {}
          const pricesData = data.prices instanceof Map ? Object.fromEntries(data.prices) : data.prices
          for (const [code, p] of Object.entries(pricesData as Record<string, { salePrice: number; originalPrice?: number }>)) {
            pricesObj[code] = {
              salePrice: p.salePrice?.toString() || "",
              originalPrice: p.originalPrice?.toString() || "",
            }
          }
          setPrices(pricesObj)
        }
        setSku(data.sku || "")
        setInventory(data.inventory?.toString() || "")
        setTrackInventory(data.trackInventory || false)
        setWeight(data.weight?.toString() || "")
        setStatus(data.status || "draft")
        setSelectedCollections(data.collections?.map((c) => c.toString()) || [])
        setStickerId(data.stickerId?.toString() || "")
        setSizeChartId(data.sizeChartId?.toString() || "")
        setGallery(data.gallery || [])
        setVariants(data.variants || [])
        setSlugManual(true)

        if (data.variants?.length) {
          const optionNames = new Set<string>()
          data.variants.forEach((v) => {
            Object.keys(v.options).forEach((k) => optionNames.add(k))
          })
          const reconstructed: ProductOption[] = Array.from(optionNames).map((optName) => ({
            name: optName,
            values: [...new Set(data.variants.map((v) => v.options[optName]).filter(Boolean))],
          }))
          setOptions(reconstructed)
        }
      } catch {
        setError("Failed to load product")
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [mode, productId])

  // ---- Auto-generate SKU on mount (create mode only) ----
  useEffect(() => {
    if (mode === "create" && !sku) {
      setSku(`SKU-${Date.now()}`)
    }
  }, [mode, sku])

  const handleNameChange = (n: string) => {
    setName(n)
    if (!slugManual) setSlug(generateSlug(n))
  }

  // ---- Media upload hook ----
  const { handleAddMedia } = useMediaUpload(setGallery, setUploadingCount)

  const handleRemoveMedia = async (index: number) => {
    const item = gallery[index]
    setDeletingIndex(index)
    try {
      await axios.delete(`/api/uploads/${encodeURIComponent(item.url)}`)
    } catch (err) {
      console.error("Failed to delete asset:", err)
    }
    setGallery((prev) => prev.filter((_, i) => i !== index))
    setDeletingIndex(null)
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const fromIndex = dragItem.current
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }
    setGallery((prev) => {
      const items = [...prev]
      const [moved] = items.splice(fromIndex, 1)
      items.splice(dropIndex, 0, moved)
      return items.map((item, i) => ({ ...item, order: i }))
    })
    setDragOverIndex(null)
    dragItem.current = null
  }

  // ---- Options & Variants ----
  const handleAddOption = () => {
    setOptions((prev) => [...prev, { name: "", values: [] }])
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    if (newOptions.length > 0 && newOptions.every((o) => o.name && o.values.length > 0)) {
      setVariants(generateVariantMatrix(newOptions, variants, sku, { salePrice, originalPrice, currency }))
    } else if (newOptions.length === 0) {
      setVariants([])
    }
  }

  const handleOptionNameChange = (index: number, name: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], name }
    setOptions(newOptions)
  }

  const handleOptionValuesChange = (index: number, valuesStr: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], values: valuesStr.split(",").map((v) => v.trim()).filter(Boolean) }
    setOptions(newOptions)
    if (newOptions.every((o) => o.name && o.values.length > 0)) {
      setVariants(generateVariantMatrix(newOptions, variants, sku, { salePrice, originalPrice, currency }))
    }
  }

  const handleVariantFieldChange = (index: number, field: keyof IProductVariant, value: string | number) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleVariantPriceChange = (index: number, currencyCode: string, salePrice: string, originalPrice: string) => {
    setVariants((prev) => {
      const updated = [...prev]
      const v = { ...updated[index] }
      const pricesMap: Record<string, { salePrice: number; originalPrice?: number }> = v.prices ? { ...v.prices } : {}
      pricesMap[currencyCode] = {
        salePrice: salePrice ? parseFloat(salePrice) : 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      }
      v.prices = pricesMap
      updated[index] = v
      return updated
    })
  }

  const handleBulkApply = () => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (!selectedVariants.has(i)) return v
        const updated = { ...v }
        if (bulkPrice) {
          updated.price = parseFloat(bulkPrice)
          // Clear multi-currency prices since bulk price applies to primary only
          updated.prices = undefined
        }
        if (bulkInventory) updated.inventory = parseInt(bulkInventory)
        return updated
      })
    )
    setSelectedVariants(new Set())
    setBulkPrice("")
    setBulkInventory("")
  }

  const handleDuplicateVariant = (index: number) => {
    const v = variants[index]
    setVariants((prev) => [
      ...prev,
      {
        ...v,
        sku: `${v.sku}-copy`,
        name: `${v.name} (Copy)`,
        prices: v.prices ? JSON.parse(JSON.stringify(v.prices)) : undefined,
      },
    ])
  }

  const handleLoadTemplate = (template: { _id?: string; name: string; options: { name: string; values: string[] }[] }) => {
    setOptions(template.options)
    setLoadedTemplateId(template._id || null)
    setVariants(generateVariantMatrix(template.options, [], sku, { salePrice, originalPrice, currency }))
  }

  const handleSaveAsTemplate = async () => {
    if (options.length === 0) return
    const name = window.prompt("Template name:")
    if (!name) return
    try {
      const { data } = await axios.post("/api/variant-templates", { name, options })
      setTemplates((prev) => [...prev, data])
      setLoadedTemplateId(data._id)
      toast({ description: "Template saved" })
    } catch {
      toast({ description: "Failed to save template", variant: "destructive" })
    }
  }

  const handleClearTemplate = () => {
    setOptions([])
    setVariants([])
    setLoadedTemplateId(null)
  }

  // ---- Apply discount % → auto-fill compare-at everywhere ----
  const handleApplyDiscount = (pct: number) => {
    // 1. Main product compare-at
    if (salePrice) {
      setOriginalPrice((parseFloat(salePrice) * (1 + pct / 100)).toFixed(2))
    }
    // 2. All additional currency prices
    setPrices((prev) => {
      const updated = { ...prev }
      for (const code of Object.keys(updated)) {
        const sp = parseFloat(updated[code].salePrice)
        if (!isNaN(sp) && sp > 0) {
          updated[code] = { ...updated[code], originalPrice: (sp * (1 + pct / 100)).toFixed(2) }
        }
      }
      return updated
    })
    // 3. All variants — base currency compareAt + multi-currency originalPrice
    setVariants((prev) =>
      prev.map((v) => {
        const updated = { ...v }
        if (v.price > 0) {
          updated.compareAt = parseFloat((v.price * (1 + pct / 100)).toFixed(2))
        }
        if (v.prices) {
          const updatedPrices: typeof v.prices = {}
          for (const [code, p] of Object.entries(v.prices)) {
            updatedPrices[code] = {
              ...p,
              originalPrice: p.salePrice > 0
                ? parseFloat((p.salePrice * (1 + pct / 100)).toFixed(2))
                : p.originalPrice,
            }
          }
          updated.prices = updatedPrices
        }
        return updated
      })
    )
  }

  // ---- Margin calculation ----
  const salePriceNum = salePrice ? parseFloat(salePrice) : 0
  const originalPriceNum = originalPrice ? parseFloat(originalPrice) : 0
  const margin = salePriceNum > 0 && originalPriceNum > 0
    ? (((originalPriceNum - salePriceNum) / originalPriceNum) * 100).toFixed(0)
    : null

  // ---- Size Chart → Auto-generate Size variants ----
  const handleSizeChartChange = (chartId: string) => {
    setSizeChartId(chartId)
    if (!chartId || chartId === "none") return

    const chart = sizeCharts.find((sc) => sc._id.toString() === chartId)
    if (!chart || !chart.rows?.length) return

    // Build size values from chart rows + Custom if allowed
    const sizeValues = chart.rows.map((r) => r.size).filter(Boolean)
    if ((chart as unknown as { allowCustomSize?: boolean }).allowCustomSize) {
      sizeValues.push("Custom")
    }
    if (sizeValues.length === 0) return

    // Remove existing "Size" option and add new one
    const otherOptions = options.filter((o) => o.name.toLowerCase() !== "size")
    const newOptions: ProductOption[] = [{ name: "Size", values: sizeValues }, ...otherOptions]
    setOptions(newOptions)

    // Regenerate variant matrix
    if (newOptions.every((o) => o.name && o.values.length > 0)) {
      setVariants(generateVariantMatrix(newOptions, variants, sku, { salePrice, originalPrice, currency }))
    }
  }

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    if (!name || !salePrice || !sku) {
      setError("Name, sale price, and SKU are required")
      setIsSaving(false)
      return
    }

    if (selectedCollections.length === 0) {
      setError("Product must belong to at least one collection")
      setIsSaving(false)
      return
    }

    const pricesMap: Record<string, { salePrice: number; originalPrice?: number }> = {}
    for (const [code, p] of Object.entries(prices)) {
      if (p.salePrice) {
        pricesMap[code] = {
          salePrice: parseFloat(p.salePrice),
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
        }
      }
    }

    const payload: CreateProductInput | UpdateProductInput = {
      name,
      description: description || undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      salePrice: parseFloat(salePrice),
      currency,
      prices: Object.keys(pricesMap).length > 0 ? pricesMap : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      sku,
      inventory: inventory ? parseInt(inventory) : undefined,
      trackInventory,
      gallery: gallery.length > 0 ? gallery : undefined,
      collections: selectedCollections.length > 0 ? selectedCollections : undefined,
      variants: variants.length > 0 ? variants.map((v) => ({
        ...v,
        price: parseFloat(String(v.price)),
        compareAt: v.compareAt ? parseFloat(String(v.compareAt)) : undefined,
        inventory: v.inventory != null ? parseInt(String(v.inventory)) : undefined,
      })) : undefined,
      stickerId: stickerId || undefined,
      sizeChartId: sizeChartId || undefined,
      status,
    }

    try {
      if (mode === "create") {
        const result = await createProduct(payload as CreateProductInput)
        if (result) {
          toast({ description: "Product created successfully" })
          router.push(`/admin/products/${result._id}`)
        }
      } else if (productId) {
        await updateProduct(productId, payload as UpdateProductInput)
        toast({ description: "Product saved" })
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : `Failed to ${mode === "create" ? "create" : "save"} product`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ---- Loading state ----
  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-background-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight">
              {mode === "create" ? "Add product" : name || "Edit product"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push("/admin/products")}>
            Discard
          </Button>
          {mode === "edit" && slug && (
            <Link
              href={`/products/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 px-3 rounded-md border-2 border-border bg-background-muted hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Link>
          )}
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={isSaving || isLoading}>
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? "Saving..." : mode === "create" ? "Save product" : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-xs px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      {/* Main Layout: Content + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT: Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title & Description */}
          <SectionCard title="Product details">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs">Title</Label>
                <Input
                  id="title"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Short sleeve t-shirt"
                  className="h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <MarkdownEditor
                  value={description}
                  onChange={(v) => setDescription(v)}
                  placeholder="Add a description..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Media */}
          <SectionCard
            title="Media"
            action={
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={handleAddMedia} disabled={uploadingCount > 0}>
                <Upload className="h-3 w-3 mr-1" />
                {uploadingCount > 0 ? `Uploading ${uploadingCount}...` : "Add"}
              </Button>
            }
          >
            <MediaSection
              gallery={gallery}
              uploadingCount={uploadingCount}
              deletingIndex={deletingIndex}
              dragOverIndex={dragOverIndex}
              onAddMedia={handleAddMedia}
              onRemoveMedia={handleRemoveMedia}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={() => setDragOverIndex(null)}
              setGallery={setGallery}
            />
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Pricing">
            <PricingSection
              currency={currency}
              setCurrency={setCurrency}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
              originalPrice={originalPrice}
              setOriginalPrice={setOriginalPrice}
              prices={prices}
              setPrices={setPrices}
              supportedCurrencies={supportedCurrencies}
              margin={margin}
              originalPriceNum={originalPriceNum}
              salePriceNum={salePriceNum}
              onApplyDiscount={handleApplyDiscount}
            />
          </SectionCard>

          {/* Inventory */}
          <SectionCard title="Inventory">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">SKU *</Label>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-9 text-sm font-mono"
                  placeholder="TSHIRT-001"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="0.5"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="rounded accent-accent"
              />
              <span className="text-xs text-secondary">Track inventory for this product</span>
            </label>
          </SectionCard>

          {/* Variants */}
          <SectionCard
            title="Variants"
            action={
              options.length === 0 ? (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={handleAddOption}>
                  <Plus className="h-3 w-3 mr-1" /> Add options
                </Button>
              ) : null
            }
          >
            {options.length === 0 && variants.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted">
                  Add options like size or color to create variants
                </p>
                <Button type="button" variant="link" size="sm" className="text-xs mt-1" onClick={handleAddOption}>
                  + Add options like size or color
                </Button>
              </div>
            ) : (
              <VariantsSection
                options={options}
                variants={variants}
                selectedVariants={selectedVariants}
                bulkPrice={bulkPrice}
                bulkInventory={bulkInventory}
                expandedVariant={expandedVariant}
                currency={currency}
                supportedCurrencies={supportedCurrencies}
                sku={sku}
                templates={templates}
                loadedTemplateId={loadedTemplateId}
                onLoadTemplate={handleLoadTemplate}
                onSaveAsTemplate={handleSaveAsTemplate}
                onClearTemplate={handleClearTemplate}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onOptionNameChange={handleOptionNameChange}
                onOptionValuesChange={handleOptionValuesChange}
                onVariantFieldChange={handleVariantFieldChange}
                onVariantPriceChange={handleVariantPriceChange}
                onBulkApply={handleBulkApply}
                onDuplicateVariant={handleDuplicateVariant}
                onDeleteVariant={(i) => {
                setVariants((prev) => prev.filter((_, idx) => idx !== i))
                setSelectedVariants((prev) => {
                  const next = new Set<number>()
                  for (const s of prev) {
                    if (s < i) next.add(s)
                    else if (s > i) next.add(s - 1)
                  }
                  return next
                })
              }}
                setSelectedVariants={setSelectedVariants}
                setBulkPrice={setBulkPrice}
                setBulkInventory={setBulkInventory}
                setExpandedVariant={setExpandedVariant}
                setVariants={setVariants}
              />
            )}
          </SectionCard>

          {/* SEO Preview */}
          <SectionCard title="Search engine listing" collapsible defaultOpen={false}>
            <SeoSection
              slug={slug}
              name={name}
              description={description}
              onSlugChange={setSlug}
              setSlugManual={setSlugManual}
            />
          </SectionCard>
        </div>

        {/* RIGHT: Sidebar */}
        <SidebarSection
          status={status}
          setStatus={setStatus}
          selectedCollections={selectedCollections}
          setSelectedCollections={setSelectedCollections}
          stickerId={stickerId}
          setStickerId={setStickerId}
          sizeChartId={sizeChartId}
          setSizeChartId={setSizeChartId}
          collections={collections}
          stickers={stickers}
          sizeCharts={sizeCharts}
          onSizeChartChange={handleSizeChartChange}
        />
      </div>
    </form>
  )
}