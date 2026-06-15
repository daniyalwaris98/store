"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { IFilterSet } from "@/lib/db/models/FilterSet"

interface FilterSidebarProps {
  filters: IFilterSet[]
  selectedFilters: Record<string, string | string[] | number[]>
  onFilterChange: (filterSlug: string, value: string | string[] | number[]) => void
}

export function FilterSidebar({ filters, selectedFilters, onFilterChange }: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Filters</h3>

      {filters.map((filter) => (
        <div key={filter._id.toString()} className="space-y-3">
          <Label className="text-sm font-medium">{filter.name}</Label>

          {filter.type === "select" && filter.options && (
            <div className="space-y-2">
              {filter.options.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={filter.slug}
                    checked={selectedFilters[filter.slug] === option}
                    onChange={() => onFilterChange(filter.slug, option)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}

          {filter.type === "multiselect" && filter.options && (
            <div className="space-y-2">
              {filter.options.map((option) => {
                const selected = (selectedFilters[filter.slug] as string[]) || []
                return (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={(e) => {
                        const current = (selectedFilters[filter.slug] as string[]) || []
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter((v) => v !== option)
                        onFilterChange(filter.slug, updated)
                      }}
                      className="accent-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                )
              })}
            </div>
          )}

          {filter.type === "range" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={((selectedFilters[filter.slug] as number[]) || [])[0] || ""}
                  onChange={(e) =>
                    onFilterChange(filter.slug, [Number(e.target.value), ((selectedFilters[filter.slug] as number[]) || [])[1] || filter.rangeMax || 0])
                  }
                  className="w-20"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={((selectedFilters[filter.slug] as number[]) || [])[1] || ""}
                  onChange={(e) =>
                    onFilterChange(filter.slug, [((selectedFilters[filter.slug] as number[]) || [])[0] || filter.rangeMin || 0, Number(e.target.value)])
                  }
                  className="w-20"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}