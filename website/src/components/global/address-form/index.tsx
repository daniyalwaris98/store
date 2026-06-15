"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Address } from "@/types/order"

interface AddressFormProps {
  address?: Partial<Address>
  onSubmit?: (address: Address) => Promise<void>
  onCancel?: () => void
}

export function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
    label: address?.label || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    country: address?.country || "",
    postalCode: address?.postalCode || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit?.(formData as Address)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Home, Work, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder="123 Main St"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="New York"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="NY"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="United States"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="10001"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Address"}
        </Button>
      </div>
    </form>
  )
}