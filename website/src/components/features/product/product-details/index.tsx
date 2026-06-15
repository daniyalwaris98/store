"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  Minus,
  Plus,
  Share2,
  AlertCircle,
  Truck,
  RotateCcw,
  Ruler,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductGallery } from "@/components/features/product/product-gallery"
import { VariantSelector } from "@/components/global/variant-selector"
import { CustomSizeForm } from "@/components/features/product/CustomSizeForm"
import { formatCurrency } from "@/lib/utils"
import { resolveProductPrice } from "@/lib/currency"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ProductVariant } from "@/types/product"

interface GalleryItem {
  url: string
  alt?: string
}

interface ProductVariantData {
  sku: string
  name: string
  price: number
  inventory?: number
  prices?: Record<string, { salePrice: number; originalPrice?: number }>
  options: Record<string, string>
}

interface SizeChartData {
  _id: string
  name: string
  images: string[]
  columns: string[]
  rows: { size: string; measurements: string[] }[]
  allowCustomSize: boolean
  customSizeFields: string[]
}

interface ProductDetailsProps {
  product: {
    _id: string
    name: string
    slug: string
    sku: string
    description?: string
    salePrice: number
    originalPrice?: number
    gallery?: GalleryItem[]
    variants?: ProductVariantData[]
    currency?: string
    prices?: Record<string, { salePrice: number; originalPrice?: number }>
    trackInventory?: boolean
    inventory?: number
    sizeChartId?: SizeChartData | string
  }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariantData, setSelectedVariantData] =
    useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [copied, setCopied] = useState(false)

  // Size chart state
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showCustomSizeForm, setShowCustomSizeForm] = useState(false)
  const [customMeasurements, setCustomMeasurements] = useState<Record<string, string> | null>(null)

  const { addItem, openCart } = useCart()
  const { currency: selectedCurrency } = useCurrency()
  const router = useRouter()

  // Parse size chart from product (populated by API)
  const sizeChart: SizeChartData | null =
    product.sizeChartId && typeof product.sizeChartId === "object"
      ? (product.sizeChartId as SizeChartData)
      : null

  // Check if selected variant is "Custom" size
  const isCustomSizeSelected =
    selectedVariantData?.options?.Size === "Custom" ||
    selectedVariantData?.options?.size === "Custom"

  // Custom size requires measurements to be filled
  const customSizeReady = isCustomSizeSelected ? customMeasurements !== null : true

  // Load saved measurements from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("custom-size-measurements")
    if (stored) {
      try {
        setCustomMeasurements(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  const resolved = resolveProductPrice(
    {
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      currency: product.currency || "USD",
      prices: product.prices,
    },
    selectedCurrency
  )

  const variantResolved = selectedVariantData
    ? resolveProductPrice(
        {
          salePrice: selectedVariantData.price || 0,
          originalPrice: (selectedVariantData as ProductVariant).compareAt,
          currency: product.currency || "USD",
          prices: (
            selectedVariantData as {
              prices?: Record<
                string,
                { salePrice: number; originalPrice?: number }
              >
            }
          ).prices,
        },
        selectedCurrency
      )
    : null

  const displayPrice = variantResolved?.salePrice ?? resolved.salePrice
  const hasDiscount =
    (variantResolved?.originalPrice ?? resolved.originalPrice) &&
    (variantResolved?.originalPrice ?? resolved.originalPrice)! > displayPrice
  const discountPercent = hasDiscount
    ? Math.round(
        (1 -
          displayPrice /
            (variantResolved?.originalPrice ?? resolved.originalPrice)!) *
          100
      )
    : 0

  const requiresVariant = product.variants && product.variants.length > 0
  const isVariantSelected = !requiresVariant || selectedVariantData !== null

  const productInfoAccordions = [
    {
      icon: AlertCircle,
      title: "Disclaimer",
      content: `<p>Product colors may vary slightly due to screen resolution and lighting conditions. Sizes are approximate and may vary by ±1cm. Results may vary from person to person. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>`,
    },
    {
      icon: Truck,
      title: "Shipping Policy",
      content: `<ul><li>Free standard shipping on orders over $50</li><li>Standard shipping (5-7 business days) - $5.99</li><li>Express shipping (2-3 business days) - $12.99</li><li>International shipping available to select countries</li><li>Orders are processed within 1-2 business days</li></ul>`,
    },
    {
      icon: RotateCcw,
      title: "Returns & Refunds",
      content: `<ul><li>We accept returns within 30 days of delivery</li><li>Items must be unused and in original packaging</li><li>Contact our support team to initiate a return</li><li>Refunds are processed within 5-7 business days</li><li>Shipping costs are non-refundable</li></ul>`,
    },
  ]

  const handleAddToCart = () => {
    if (!isVariantSelected || !customSizeReady) return

    addItem({
      productId: product._id,
      name: product.name,
      price: displayPrice,
      quantity,
      variantId: selectedVariantData?.sku || undefined,
      variantOptions: selectedVariantData?.options,
      customMeasurements: isCustomSizeSelected ? (customMeasurements ?? undefined) : undefined,
      image: product.gallery?.[0]?.url,
    })
    openCart()
  }

  const handleBuyNow = () => {
    if (!isVariantSelected || !customSizeReady) return

    addItem({
      productId: product._id,
      name: product.name,
      price: displayPrice,
      quantity,
      variantId: selectedVariantData?.sku || undefined,
      variantOptions: selectedVariantData?.options,
      customMeasurements: isCustomSizeSelected ? (customMeasurements ?? undefined) : undefined,
      image: product.gallery?.[0]?.url,
    })
    router.push("/checkout")
  }

  const handleCustomMeasurementsSave = (m: Record<string, string>) => {
    setCustomMeasurements(m)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
        {/* Product Gallery - sticky on desktop */}
        <div className="sm:sticky sm:top-20 sm:self-start">
          <ProductGallery
            items={
              product.gallery?.map((img, i) => ({
                url: img.url,
                type: "image" as const,
                order: i,
              })) ?? []
            }
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                {formatCurrency(displayPrice, resolved.currency)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(variantResolved?.originalPrice ?? resolved.originalPrice!, resolved.currency)}
                  </span>
                  <span className="bg-accent text-white text-sm font-semibold px-2 py-1 rounded">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <VariantSelector
                variants={product.variants}
                onVariantChange={setSelectedVariantData}
              />
            </div>
          )}

          {/* Custom Size CTA — shown when Custom variant is selected */}
          {isCustomSizeSelected && sizeChart && (
            <div className="border border-accent/30 bg-accent/5 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Custom Size Selected</p>
                  {customMeasurements ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Your measurements:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(customMeasurements).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-xs bg-background border border-border rounded-md px-2 py-1"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCustomSizeForm(true)}
                        className="text-xs text-accent hover:underline mt-1"
                      >
                        Edit measurements
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Please provide your body measurements to continue
                    </p>
                  )}
                </div>
              </div>
              {!customMeasurements && (
                <Button
                  size="sm"
                  onClick={() => setShowCustomSizeForm(true)}
                  className="w-full"
                >
                  <Ruler className="h-4 w-4 mr-2" />
                  Enter Your Measurements
                </Button>
              )}
            </div>
          )}

          {/* Size Chart Link — shown when product has a size chart */}
          {sizeChart && (
            <button
              onClick={() => setShowSizeChart(true)}
              className="flex items-center gap-2 text-sm text-accent hover:underline transition-colors"
            >
              <Ruler className="h-4 w-4" />
              View Size Chart
            </button>
          )}

          {/* Stock */}
          {product.trackInventory && (
            <p className="text-sm text-muted-foreground">
              {product.inventory! > 10
                ? "In Stock"
                : product.inventory! > 0
                  ? `Only ${product.inventory} left`
                  : "Out of Stock"}
            </p>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Quantity</span>
            <div className="flex items-center border border-border rounded-xl">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-muted/50 transition-colors rounded-l-xl"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="h-11 w-12 flex items-center justify-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-11 w-11 flex items-center justify-center hover:bg-muted/50 transition-colors rounded-r-xl"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              size="lg"
              className="w-full min-h-12"
              onClick={handleAddToCart}
              disabled={!isVariantSelected || !customSizeReady}
            >
              {isCustomSizeSelected && !customMeasurements
                ? "Enter Measurements First"
                : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full min-h-12"
              onClick={handleBuyNow}
              disabled={!isVariantSelected || !customSizeReady}
            >
              Buy Now
            </Button>
          </div>

          {/* Cant proceed notice */}
          {isCustomSizeSelected && !customMeasurements && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Info className="h-4 w-4 shrink-0" />
              <span>You need to provide your measurements before adding to cart</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <div className="prose prose-sm text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.description || ""}
              </ReactMarkdown>
            </div>
          </div>

          {/* Product Info Accordions */}
          <Accordion type="single" collapsible className="w-full">
            {productInfoAccordions.map((item) => (
              <AccordionItem
                key={item.title.toLowerCase().replace(/\s+/g, "-")}
                value={item.title.toLowerCase().replace(/\s+/g, "-")}
              >
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="text-muted-foreground text-sm leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="transition-all duration-200">
              {copied ? "Copied!" : "Share"}
            </span>
          </button>
        </div>
      </div>

      {/* Size Chart Dialog */}
      {sizeChart && (
        <Dialog open={showSizeChart} onOpenChange={setShowSizeChart}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                {sizeChart.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2 overflow-auto">
              {/* Size Guide Images */}
              {sizeChart.images && sizeChart.images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {sizeChart.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Measurement guide ${i + 1}`}
                        className="rounded-xl border border-border w-full object-contain"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Chart Table */}
              <Table className="overflow-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold sticky left-0 bg-background z-10">Size</TableHead>
                    {sizeChart.columns.map((col, i) => (
                      <TableHead className="whitespace-nowrap" key={i}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizeChart.rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">{row.size}</TableCell>
                      {row.measurements.map((m, j) => (
                        <TableCell key={j}>{m || "-"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Size Form Dialog */}
      {sizeChart?.allowCustomSize && (
        <CustomSizeForm
          open={showCustomSizeForm}
          onOpenChange={setShowCustomSizeForm}
          fields={sizeChart.customSizeFields}
          guideImages={sizeChart.images}
          onSave={handleCustomMeasurementsSave}
        />
      )}
    </div>
  )
}