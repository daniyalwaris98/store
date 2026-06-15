"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Ruler, Check } from "lucide-react"

const LOCAL_STORAGE_KEY = "custom-size-measurements"

interface CustomSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: string[]
  guideImages?: string[]
  onSave: (measurements: Record<string, string>) => void
}

export function CustomSizeForm({ open, onOpenChange, fields, guideImages, onSave }: CustomSizeFormProps) {
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, string>
        setMeasurements(parsed)
      } catch {
        // ignore
      }
    }
  }, [])

  const handleFieldChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Save to localStorage for future visits
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(measurements))
    onSave(measurements)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onOpenChange(false)
    }, 800)
  }

  const allFieldsFilled = fields.every((field) => measurements[field]?.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5" />
            Your Custom Measurements
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your body measurements in inches for a perfectly tailored fit. Your measurements are saved locally for future orders.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Size Guide Image */}
          {guideImages && guideImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">How to Measure</Label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {guideImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Measurement guide ${i + 1}`}
                    className="rounded-xl border border-border max-h-48 w-auto object-contain"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Measurement Fields */}
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={`measure-${field}`} className="text-sm">
                  {field} <span className="text-xs text-muted-foreground">(inches)</span>
                </Label>
                <Input
                  id={`measure-${field}`}
                  type="text"
                  inputMode="decimal"
                  value={measurements[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder="e.g., 38"
                  className="h-10"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Tip: Your measurements are saved automatically in your browser. You won&apos;t need to fill them again on your next visit.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!allFieldsFilled}>
            {saved ? (
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Saved!
              </span>
            ) : (
              "Save Measurements"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to load custom measurements from localStorage
 */
export function useCustomMeasurements() {
  const [measurements, setMeasurements] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        setMeasurements(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  return measurements
}
