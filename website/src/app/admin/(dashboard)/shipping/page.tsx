"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Truck, X } from "lucide-react"
import { useAdminShipping } from "@/hooks"
import type { CreateShippingZoneInput, ShippingRate } from "@/lib/validators/shipping"
import type { IShippingZone } from "@/lib/db/models/ShippingZone"

const COMMON_COUNTRIES = [
  "US", "CA", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT",
  "CH", "AU", "NZ", "JP", "KR", "SG", "HK", "TW", "AE", "SA",
]

const STATUS_COLORS = {
  active: "bg-success-light text-success",
  inactive: "bg-muted text-secondary",
}

interface ZoneFormData {
  name: string
  countries: string
  rates: ShippingRate[]
  handlingFee: string
  status: "active" | "inactive"
}

const initialFormData: ZoneFormData = {
  name: "",
  countries: "",
  rates: [{ name: "", price: 0, perKg: 0, freeShipping: false }],
  handlingFee: "0",
  status: "active",
}

export default function AdminShippingPage() {
  const { zones, isLoading, error, fetchZones, createZone, updateZone, deleteZone } = useAdminShipping()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<IShippingZone | null>(null)
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const openCreateDialog = () => {
    setEditingZone(null)
    setFormData(initialFormData)
    setFormError(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (zone: IShippingZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      countries: zone.countries.join(", "),
      rates: zone.rates.length > 0 ? zone.rates : [{ name: "", price: 0, perKg: 0, freeShipping: false }],
      handlingFee: zone.handlingFee.toString(),
      status: zone.status,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingZone(null)
    setFormData(initialFormData)
    setFormError(null)
  }

  const handleAddRate = () => {
    setFormData((prev) => ({
      ...prev,
      rates: [...prev.rates, { name: "", price: 0, perKg: 0, freeShipping: false }],
    }))
  }

  const handleRemoveRate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rates: prev.rates.filter((_, i) => i !== index),
    }))
  }

  const handleRateChange = (index: number, field: keyof ShippingRate, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      rates: prev.rates.map((rate, i) =>
        i === index ? { ...rate, [field]: value } : rate
      ),
    }))
  }

  const handleCountryToggle = (code: string) => {
    const current = formData.countries.split(",").map((c) => c.trim()).filter(Boolean)
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code]
    setFormData((prev) => ({ ...prev, countries: updated.join(", ") }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError("Zone name is required")
      return false
    }
    const countries = formData.countries.split(",").map((c) => c.trim()).filter(Boolean)
    if (countries.length === 0) {
      setFormError("At least one country is required")
      return false
    }
    if (formData.rates.length === 0 || !formData.rates.some((r) => r.name.trim())) {
      setFormError("At least one shipping rate is required")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setActionLoading(editingZone?._id?.toString() || "create")
    setFormError(null)

    const payload: CreateShippingZoneInput = {
      name: formData.name.trim(),
      countries: formData.countries.split(",").map((c) => c.trim()).filter(Boolean),
      rates: formData.rates.filter((r) => r.name.trim()),
      handlingFee: parseFloat(formData.handlingFee) || 0,
      status: formData.status,
    }

    let success = false
    if (editingZone) {
      const result = await updateZone(editingZone._id.toString(), payload)
      success = !!result
    } else {
      const result = await createZone(payload)
      success = !!result
    }

    setActionLoading(null)
    if (success) {
      closeDialog()
      fetchZones()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return
    setActionLoading(id)
    await deleteZone(id)
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Shipping Zones
          </h1>
          <p className="text-secondary mt-1">
            Manage shipping rates by region
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-danger-light text-danger rounded-lg border border-danger">
          {error}
        </div>
      )}

      {/* Zones Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Countries</TableHead>
              <TableHead>Rates</TableHead>
              <TableHead className="text-right">Handling Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-secondary">
                  No shipping zones yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone._id.toString()}>
                  <TableCell className="font-semibold">{zone.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {zone.countries.slice(0, 3).map((code) => (
                        <span key={code} className="px-2 py-0.5 bg-background-muted border border-border rounded text-xs font-medium">
                          {code}
                        </span>
                      ))}
                      {zone.countries.length > 3 && (
                        <span className="px-2 py-0.5 bg-background-muted border border-border rounded text-xs font-medium">
                          +{zone.countries.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {zone.rates.slice(0, 2).map((rate, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-secondary">{rate.name}:</span>
                          <span className="font-semibold">
                            {rate.freeShipping
                              ? "Free"
                              : `$${rate.price.toFixed(2)}${rate.perKg > 0 ? ` + $${rate.perKg}/kg` : ""}`}
                          </span>
                        </div>
                      ))}
                      {zone.rates.length > 2 && (
                        <span className="text-xs text-secondary">
                          +{zone.rates.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {zone.handlingFee > 0 ? `$${zone.handlingFee.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[zone.status]}`}>
                      {zone.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(zone)}
                        disabled={actionLoading !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:text-danger hover:bg-danger-light"
                        onClick={() => handleDelete(zone._id.toString())}
                        disabled={actionLoading === zone._id.toString()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Zone Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editingZone ? "Edit Shipping Zone" : "Create Shipping Zone"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., North America, Europe"
              />
            </div>

            {/* Countries */}
            <div className="space-y-2">
              <Label>Countries</Label>
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {COMMON_COUNTRIES.map((code) => {
                    const selected = formData.countries.split(",").map((c) => c.trim()).includes(code)
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCountryToggle(code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
                          selected
                            ? "bg-primary text-white shadow-sm"
                            : "bg-background-muted text-secondary hover:bg-muted hover:shadow-sm hover:-translate-y-0.5"
                        }`}
                      >
                        {code}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">Or enter manually:</span>
                  <Input
                    value={formData.countries}
                    onChange={(e) => setFormData((prev) => ({ ...prev, countries: e.target.value }))}
                    placeholder="US, CA, GB (comma separated)"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Handling Fee */}
            <div className="space-y-2">
              <Label htmlFor="handlingFee">Handling Fee ($)</Label>
              <Input
                id="handlingFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.handlingFee}
                onChange={(e) => setFormData((prev) => ({ ...prev, handlingFee: e.target.value }))}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-4">
                {(["active", "inactive"] as const).map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={() => setFormData((prev) => ({ ...prev, status }))}
                    />
                    <span className="capitalize text-secondary">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Shipping Rates</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rate
                </Button>
              </div>

              <div className="space-y-3">
                {formData.rates.map((rate, index) => (
                  <div key={index} className="border border-border rounded-xl p-4 space-y-3 transition-all duration-200 ease-out hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Rate {index + 1}</span>
                      {formData.rates.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={rate.name}
                          onChange={(e) => handleRateChange(index, "name", e.target.value)}
                          placeholder="e.g., Standard, Express"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rate.price}
                          onChange={(e) => handleRateChange(index, "price", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Per Kg ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rate.perKg}
                          onChange={(e) => handleRateChange(index, "perKg", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Free Above ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rate.freeAbove ?? ""}
                          onChange={(e) => handleRateChange(index, "freeAbove", e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rate.freeShipping}
                          onChange={(e) => handleRateChange(index, "freeShipping", e.target.checked)}
                        />
                        <span className="text-sm text-secondary">Free shipping</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rate.weightAbove !== undefined}
                          onChange={(e) => handleRateChange(index, "weightAbove", e.target.checked ? 0 : undefined)}
                        />
                        <span className="text-sm text-secondary">Weight threshold</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-danger-light text-danger rounded-lg text-sm border border-danger">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={actionLoading !== null}
            >
              {actionLoading === (editingZone?._id?.toString() || "create") ? "Saving..." : editingZone ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}