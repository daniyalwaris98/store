"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, MapPin, Edit, DollarSign, Check } from "lucide-react"
import axios from "axios"
import { SUPPORTED_CURRENCIES, type CurrencyConfig } from "@/lib/currency"
import { useToast } from "@/context/ToastContext"

interface ShippingZone {
  _id: string
  name: string
  countries: string[]
  rates: {
    name: string
    price: number
    currency: string
  }[]
  isActive: boolean
}

interface CurrencySettings {
  defaultCurrency: string
  supportedCurrencies: string[]
}

export default function AdminSettingsPage() {
  const toast = useToast()

  // ---- Shipping Zones ----
  const [zones, setZones] = useState<ShippingZone[]>(() => [])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    countries: "",
    basePrice: "",
  })

  // ---- Currency Settings ----
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>({
    defaultCurrency: "USD",
    supportedCurrencies: ["USD"],
  })
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [currencySaving, setCurrencySaving] = useState(false)

  const allCurrencies = Object.values(SUPPORTED_CURRENCIES)

  // ---- Load Data ----
  useEffect(() => {
    axios.get<ShippingZone[]>("/api/shipping/zones")
      .then(({ data }) => setZones(data))
      .catch((error) => console.error("Failed to fetch shipping zones:", error))
      .finally(() => setIsLoading(false))

    axios.get<CurrencySettings>("/api/store-settings")
      .then(({ data }) => setCurrencySettings(data))
      .catch((error) => console.error("Failed to fetch currency settings:", error))
      .finally(() => setCurrencyLoading(false))
  }, [])

  // ---- Currency Handlers ----
  const toggleCurrency = (code: string) => {
    setCurrencySettings((prev) => {
      const supported = prev.supportedCurrencies.includes(code)
        ? prev.supportedCurrencies.filter((c) => c !== code)
        : [...prev.supportedCurrencies, code]

      // Ensure at least one currency and default is always included
      if (supported.length === 0) return prev
      const newDefault = supported.includes(prev.defaultCurrency)
        ? prev.defaultCurrency
        : supported[0]

      return { defaultCurrency: newDefault, supportedCurrencies: supported }
    })
  }

  const setDefaultCurrency = (code: string) => {
    setCurrencySettings((prev) => {
      if (!prev.supportedCurrencies.includes(code)) {
        return {
          defaultCurrency: code,
          supportedCurrencies: [...prev.supportedCurrencies, code],
        }
      }
      return { ...prev, defaultCurrency: code }
    })
  }

  const saveCurrencySettings = async () => {
    setCurrencySaving(true)
    try {
      const { data } = await axios.put<CurrencySettings>("/api/store-settings", currencySettings)
      setCurrencySettings(data)
      toast({ description: "Currency settings saved" })
    } catch (error) {
      console.error("Failed to save currency settings:", error)
      toast({ description: "Failed to save currency settings", variant: "destructive" })
    } finally {
      setCurrencySaving(false)
    }
  }

  // ---- Shipping Handlers ----
  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        countries: formData.countries.split(",").map((c) => c.trim()).filter(Boolean),
        rates: [{
          name: "Standard Shipping",
          price: parseFloat(formData.basePrice) || 0,
          currency: currencySettings.defaultCurrency,
        }],
        isActive: true,
      }

      if (editingZone) {
        await axios.put(`/api/shipping/zones/${editingZone._id}`, payload)
      } else {
        await axios.post("/api/shipping/zones", payload)
      }

      setIsDialogOpen(false)
      setEditingZone(null)
      setFormData({ name: "", countries: "", basePrice: "" })
      reloadZones()
    } catch (error) {
      console.error("Failed to save shipping zone:", error)
    }
  }

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      countries: zone.countries.join(", "),
      basePrice: zone.rates[0]?.price.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this shipping zone?")) {
      try {
        await axios.delete(`/api/shipping/zones/${id}`)
        reloadZones()
      } catch (error) {
        console.error("Failed to delete shipping zone:", error)
      }
    }
  }

  const reloadZones = () => {
    setIsLoading(true)
    axios.get<ShippingZone[]>("/api/shipping/zones")
      .then(({ data }) => setZones(data))
      .catch((error) => console.error("Failed to fetch shipping zones:", error))
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* ============================================================ */}
      {/* CURRENCY SETTINGS                                            */}
      {/* ============================================================ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency
            </CardTitle>
            <Button
              size="sm"
              onClick={saveCurrencySettings}
              disabled={currencySaving || currencyLoading}
            >
              {currencySaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currencyLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Default Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Default Currency</Label>
                <p className="text-xs text-secondary">
                  This is the primary currency for product prices. New products will use this by default.
                </p>
                <Select
                  value={currencySettings.defaultCurrency}
                  onValueChange={setDefaultCurrency}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCurrencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-background-muted px-1.5 py-0.5 rounded">
                            {c.symbol}
                          </span>
                          {c.name} ({c.code})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supported Currencies */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Supported Currencies</Label>
                <p className="text-xs text-secondary">
                  Customers can switch between these currencies on the storefront. You can set different prices per currency on each product.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {allCurrencies.map((c) => {
                    const isEnabled = currencySettings.supportedCurrencies.includes(c.code)
                    const isDefault = currencySettings.defaultCurrency === c.code
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          if (isDefault) return // Can't disable default
                          toggleCurrency(c.code)
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                          isEnabled
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border hover:border-accent/40 hover:bg-accent/5"
                        } ${isDefault ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          isEnabled ? "bg-accent text-white" : "bg-background-muted text-secondary"
                        }`}>
                          {c.symbol}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-secondary">{c.code}</p>
                        </div>
                        {isDefault && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        {isEnabled && !isDefault && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* SHIPPING ZONES                                               */}
      {/* ============================================================ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Zones
            </CardTitle>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
              <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Zone Name</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-secondary">
                    No shipping zones configured
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone._id}>
                    <TableCell className="font-semibold">{zone.name}</TableCell>
                    <TableCell className="text-secondary">
                      {zone.countries.slice(0, 3).join(", ")}
                      {zone.countries.length > 3 && ` +${zone.countries.length - 3} more`}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${zone.rates[0]?.price.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          zone.isActive
                            ? "bg-success-light text-success"
                            : "bg-muted text-secondary"
                        }`}
                      >
                        {zone.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-danger hover:text-danger hover:bg-danger-light"
                          onClick={() => handleDelete(zone._id)}
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
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input defaultValue="My Store" disabled />
            </div>
            <div className="space-y-2">
              <Label>Store Email</Label>
              <Input defaultValue="support@mystore.com" disabled />
            </div>
          </div>
          <p className="text-sm text-secondary">
            Store information is configured via environment variables.
          </p>
        </CardContent>
      </Card>

      {/* Create/Edit Shipping Zone Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">{editingZone ? "Edit Shipping Zone" : "Add Shipping Zone"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., North America, Europe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countries">Countries (comma-separated)</Label>
              <Input
                id="countries"
                value={formData.countries}
                onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                placeholder="US, CA, MX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Shipping Price ($)</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="9.99"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingZone ? "Save Changes" : "Create Zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}