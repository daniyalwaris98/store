"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarCard } from "./ProductForm.components"
import { Ruler } from "lucide-react"

interface SidebarSectionProps {
  status: "active" | "draft" | "archived"
  setStatus: (v: "active" | "draft" | "archived") => void
  selectedCollections: string[]
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>
  stickerId: string
  setStickerId: (v: string) => void
  sizeChartId: string
  setSizeChartId: (v: string) => void
  collections: Array<{ _id: string; name: string }>
  stickers: Array<{ _id: string; name: string; isActive: boolean }>
  sizeCharts: Array<{ _id: { toString(): string }; name: string; isActive: boolean; allowCustomSize?: boolean; rows?: Array<{ size: string }> }>
  onSizeChartChange?: (chartId: string) => void
}

export function SidebarSection({
  status,
  setStatus,
  selectedCollections,
  setSelectedCollections,
  stickerId,
  setStickerId,
  sizeChartId,
  setSizeChartId,
  collections,
  stickers,
  sizeCharts,
  onSizeChartChange,
}: SidebarSectionProps) {
  const selectedChart = sizeCharts.find((sc) => sc._id.toString() === sizeChartId)

  const handleSizeChartChange = (value: string) => {
    setSizeChartId(value)
    onSizeChartChange?.(value)
  }

  return (
    <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
      {/* Status */}
      <SidebarCard title="Status">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" /> Active
              </span>
            </SelectItem>
            <SelectItem value="draft">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning" /> Draft
              </span>
            </SelectItem>
            <SelectItem value="archived">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted" /> Archived
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </SidebarCard>

      {/* Collections */}
      <SidebarCard title="Collections">
        {collections.length === 0 ? (
          <p className="text-[11px] text-muted">No collections yet</p>
        ) : (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {collections.map((c) => (
              <label key={c._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(c._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCollections((prev) => [...prev, c._id])
                    } else {
                      setSelectedCollections((prev) => prev.filter((id) => id !== c._id))
                    }
                  }}
                  className="rounded accent-accent"
                />
                <span className="text-xs">{c.name}</span>
              </label>
            ))}
          </div>
        )}
      </SidebarCard>

      {/* Sticker / Badge */}
      <SidebarCard title="Badge / Sticker">
        <Select value={stickerId} onValueChange={setStickerId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {stickers.filter((s) => s.isActive).map((s) => (
              <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SidebarCard>

      {/* Size Chart */}
      <SidebarCard title="Size Chart">
        <Select value={sizeChartId} onValueChange={handleSizeChartChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {sizeCharts.filter((sc) => sc.isActive).map((sc) => (
              <SelectItem key={sc._id.toString()} value={sc._id.toString()}>{sc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedChart && (
          <div className="mt-2 space-y-1.5">
            {/* Show sizes */}
            {selectedChart.rows && selectedChart.rows.length > 0 && (
              <p className="text-[11px] text-secondary">
                Sizes: {selectedChart.rows.map(r => r.size).filter(Boolean).join(", ")}
                {selectedChart.allowCustomSize ? ", Custom" : ""}
              </p>
            )}
            {/* Custom size indicator */}
            {selectedChart.allowCustomSize && (
              <div className="flex items-center gap-1.5 text-[11px] text-accent">
                <Ruler className="h-3 w-3" />
                <span>Custom size enabled</span>
              </div>
            )}
          </div>
        )}
      </SidebarCard>
    </div>
  )
}