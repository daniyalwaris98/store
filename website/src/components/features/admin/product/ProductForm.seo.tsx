"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SeoSectionProps {
  slug: string
  name: string
  description: string
  onSlugChange: (slug: string) => void
  setSlugManual: (v: boolean) => void
}

export function SeoSection({ slug, name, description, onSlugChange, setSlugManual }: SeoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-xs">URL handle</Label>
        <Input
          value={slug}
          onChange={(e) => {
            setSlugManual(true)
            onSlugChange(e.target.value)
          }}
          className="h-9 text-sm font-mono"
          placeholder="product-url-handle"
        />
      </div>
      <div className="mt-3 p-3 bg-background-subtle rounded-md">
        <p className="text-xs text-success truncate">yourstore.com/products/{slug || "..."}</p>
        <p className="text-sm font-medium mt-0.5 truncate">{name || "Product title"}</p>
        <p className="text-xs text-muted line-clamp-2 mt-0.5">
          {description?.replace(/[#*_\[\]]/g, "").substring(0, 160) || "Product description will appear here..."}
        </p>
      </div>
    </div>
  )
}