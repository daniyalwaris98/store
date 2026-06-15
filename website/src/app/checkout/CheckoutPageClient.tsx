"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, Truck, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useCheckout } from "@/hooks"
import { formatCurrency } from "@/lib/utils"
import { createOrderSchema } from "@/lib/validators/order"
import type { CreateOrderInput } from "@/lib/validators/order"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
}

interface CheckoutPageClientProps {
  shippingMethods: ShippingMethod[]
}

export default function CheckoutPageClient({ shippingMethods }: CheckoutPageClientProps) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { currency } = useCurrency()
  const { order, isLoading, error, validationDetails, createOrder } = useCheckout()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]?.id || "free")

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      items: items.map((item) => ({
        product: item.productId,
        variantId: item.variantId ?? undefined,
        variantOptions: item.variantOptions,
        customMeasurements: item.customMeasurements,
        sku: item.sku || "",
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      customerInfo: {
        email: "",
        name: "",
        phone: "",
      },
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        country: "PK",
        postalCode: "",
      },
      shippingMethodId: shippingMethods[0]?.id || "free",
      paymentMethod: "cod" as const,
      currency,
    },
  })

  useEffect(() => {
    if (order) {
      clearCart()
      router.push(`/orders/${order.orderNumber}`)
    }
  }, [order, clearCart, router])

  // Reset form when cart items change (after hydration from localStorage)
  useEffect(() => {
    reset({
      items: items.map((item) => ({
        product: item.productId,
        variantId: item.variantId ?? undefined,
        variantOptions: item.variantOptions,
        customMeasurements: item.customMeasurements,
        sku: item.sku || "",
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      customerInfo: {
        email: "",
        name: "",
        phone: "",
      },
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        country: "PK",
        postalCode: "",
      },
      shippingMethodId: shippingMethods[0]?.id || "free",
      paymentMethod: "cod" as const,
      currency,
    })
  }, [items, reset, currency])

  // Apply API validation errors to form fields
  useEffect(() => {
    if (validationDetails) {
      for (const detail of validationDetails) {
        setError(detail.path as keyof CreateOrderInput, {
          message: detail.message,
        })
      }
    }
  }, [validationDetails, setError])

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShipping)
  const shippingCost = selectedMethod?.price ?? 0
  const total = subtotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const onSubmit = async () => {
    const data = getValues()
    data.currency = currency
    const result = await createOrder(data)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-background border-b border-border">
        <button
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span className="font-medium">
            {summaryOpen ? "Hide" : "Show"} order summary
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatCurrency(total, currency)}</span>
            {summaryOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {/* Mobile Summary Dropdown */}
        {summaryOpen && (
          <div className="px-4 pb-4 space-y-4 bg-background">
            <div className="space-y-4 max-h-48 overflow-y-auto pt-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 bg-muted rounded-xl shrink-0 relative">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    )}
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background text-xs px-1">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variantOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" / ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                    {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-accent font-medium">Custom Size:</p>
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(item.customMeasurements).map(([k, v]) => `${k}: ${v}"`).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{selectedMethod?.price === 0 ? "Free" : formatCurrency(shippingCost, currency)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit(
                  () => onSubmit(),
                  (errors) => console.log("Validation errors:", errors)
                )} className="space-y-8">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Contact</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("customerInfo.email")}
                    />
                    {errors.customerInfo?.email && (
                      <p className="text-xs text-destructive font-medium">{errors.customerInfo.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone / WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      {...register("customerInfo.phone")}
                    />
                    {errors.customerInfo?.phone && (
                      <p className="text-xs text-destructive font-medium">{errors.customerInfo.phone.message}</p>
                    )}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Shipping Address */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      {...register("customerInfo.name")}
                    />
                    {errors.customerInfo?.name && (
                      <p className="text-xs text-destructive font-medium">{errors.customerInfo.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">
                        Street Address <span className="text-destructive">*</span>
                      </Label>
                    <Input
                      id="street"
                      placeholder="123 Main St, Apt 4"
                      {...register("shippingAddress.street")}
                    />
                    {errors.shippingAddress?.street && (
                      <p className="text-xs text-destructive font-medium">{errors.shippingAddress.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        {...register("shippingAddress.city")}
                      />
                      {errors.shippingAddress?.city && (
                        <p className="text-xs text-destructive font-medium">{errors.shippingAddress.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        {...register("shippingAddress.state")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={shippingMethods[0]?.id ? "PK" : undefined}
                        onValueChange={(value) => setValue("shippingAddress.country", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PK">Pakistan</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.shippingAddress?.country && (
                        <p className="text-xs text-destructive font-medium">{errors.shippingAddress.country.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="12345"
                        {...register("shippingAddress.postalCode")}
                      />
                      {errors.shippingAddress?.postalCode && (
                        <p className="text-xs text-destructive font-medium">{errors.shippingAddress.postalCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Shipping Method */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Shipping Method</h2>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-border-strong ${
                        selectedShipping === method.id ? "border-primary bg-accent/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          {...register("shippingMethodId")}
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {method.price === 0 ? "Free" : formatCurrency(method.price, currency)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.shippingMethodId && (
                  <p className="text-xs text-destructive font-medium">{errors.shippingMethodId.message}</p>
                )}
              </section>

              <Separator />

              {/* Payment */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Payment</h2>
                <div className="p-4 border border-border rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      defaultChecked
                      className="h-4 w-4"
                      disabled
                    />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payment will be collected at the time of delivery. Please ensure you have the exact amount ready.
                </p>
              </section>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Complete Order"}
              </Button>
            </form>
          </div>

          {/* Right Column - Order Summary (Desktop) */}
          <div className="hidden lg:block order-1 lg:order-2">
            <div className="sticky top-24 space-y-6">
              <div className="border border-border rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <div className="space-y-4 max-h-84 overflow-y-auto pt-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 bg-muted rounded-xl shrink-0 relative">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        )}
                        <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground text-background text-xs px-1.5 font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {Object.entries(item.variantOptions)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" / ")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {formatCurrency(item.price, currency)} each
                        </p>
                        {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-accent font-medium">Custom Size:</p>
                            <p className="text-xs text-muted-foreground">
                              {Object.entries(item.customMeasurements).map(([k, v]) => `${k}: ${v}"`).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium shrink-0">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{selectedMethod?.price === 0 ? "Free" : formatCurrency(shippingCost, currency)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
