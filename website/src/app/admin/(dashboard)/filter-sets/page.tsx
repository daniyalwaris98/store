"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Pencil, Trash2, Filter } from "lucide-react"
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
import { useAdminFilterSets } from "@/hooks"
import { useToast } from "@/context/ToastContext"
import type { CreateFilterSetInput, UpdateFilterSetInput } from "@/lib/validators/filterSet"

const TYPE_LABELS = {
  select: "Single Select",
  multiselect: "Multi Select",
  range: "Range (Min-Max)",
}

export default function AdminFilterSetsPage() {
  const { filterSets, isLoading, fetchFilterSets, createFilterSet, updateFilterSet, deleteFilterSet } = useAdminFilterSets()
  const toast = useToast()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFilterSet, setEditingFilterSet] = useState<{ id: string; name: string; slug: string; type: "select" | "multiselect" | "range"; options?: string[]; rangeMin?: number; rangeMax?: number; rangeStep?: number; isActive: boolean } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "select" as "select" | "multiselect" | "range",
    options: "",
    rangeMin: "",
    rangeMax: "",
    rangeStep: "",
    isActive: true,
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFilterSets()
  }, [fetchFilterSets])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }))
    if (!slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }))
    }
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async () => {
    if (!formData.name) return

    const input: CreateFilterSetInput | UpdateFilterSetInput = {
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
      isActive: formData.isActive,
    }

    if (formData.type === "select" || formData.type === "multiselect") {
      input.options = formData.options.split("\n").map((o) => o.trim()).filter(Boolean)
    } else if (formData.type === "range") {
      if (formData.rangeMin) input.rangeMin = parseFloat(formData.rangeMin)
      if (formData.rangeMax) input.rangeMax = parseFloat(formData.rangeMax)
      if (formData.rangeStep) input.rangeStep = parseFloat(formData.rangeStep)
    }

    try {
      if (editingFilterSet) {
        await updateFilterSet(editingFilterSet.id, input)
      } else {
        await createFilterSet(input as CreateFilterSetInput)
      }
      setIsDialogOpen(false)
      setEditingFilterSet(null)
      resetForm()
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Failed to save filter set",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "select",
      options: "",
      rangeMin: "",
      rangeMax: "",
      rangeStep: "",
      isActive: true,
    })
    setSlugManuallyEdited(false)
  }

  const handleEdit = (filterSet: { id: string; name: string; slug: string; type: "select" | "multiselect" | "range"; options?: string[]; rangeMin?: number; rangeMax?: number; rangeStep?: number; isActive: boolean }) => {
    if (!filterSet) return
    setEditingFilterSet(filterSet)
    setFormData({
      name: filterSet.name,
      slug: filterSet.slug,
      type: filterSet.type,
      options: filterSet.options?.join("\n") || "",
      rangeMin: filterSet.rangeMin?.toString() || "",
      rangeMax: filterSet.rangeMax?.toString() || "",
      rangeStep: filterSet.rangeStep?.toString() || "",
      isActive: filterSet.isActive,
    })
    setSlugManuallyEdited(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this filter set?")) {
      await deleteFilterSet(id)
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setEditingFilterSet(null)
    setIsDialogOpen(true)
  }

  const filteredFilterSets = filterSets.filter((fs) =>
    fs.name.toLowerCase().includes(search.toLowerCase()) ||
    fs.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Filter Sets</h1>
          <p className="text-secondary mt-1">Create reusable filters for collections</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Filter Set
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search filter sets..."
          className="pl-9 sm:pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Sets Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Options / Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredFilterSets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-secondary">
                  No filter sets found
                </TableCell>
              </TableRow>
            ) : (
              filteredFilterSets.map((filterSet) => (
                <TableRow key={filterSet._id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted" />
                      <span className="font-semibold">{filterSet.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary font-mono text-sm">
                    {filterSet.slug}
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-full bg-accent-light text-accent text-xs font-medium">
                      {TYPE_LABELS[filterSet.type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-secondary text-sm">
                    {filterSet.type === "range" ? (
                      <span>
                        {filterSet.rangeMin ?? 0} — {filterSet.rangeMax ?? 100}
                        {filterSet.rangeStep && ` (step: ${filterSet.rangeStep})`}
                      </span>
                    ) : (
                      <span>{filterSet.options?.length || 0} options</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        filterSet.isActive
                          ? "bg-success-light text-success"
                          : "bg-muted text-secondary"
                      }`}
                    >
                      {filterSet.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit({ id: filterSet._id.toString(), name: filterSet.name, slug: filterSet.slug, type: filterSet.type, options: filterSet.options, rangeMin: filterSet.rangeMin, rangeMax: filterSet.rangeMax, rangeStep: filterSet.rangeStep, isActive: filterSet.isActive })}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-danger focus:text-danger"
                          onClick={() => handleDelete(filterSet._id.toString())}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">{editingFilterSet ? "Edit Filter Set" : "Add Filter Set"}</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="bg-danger/10 text-danger px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Color, Size, Price Range"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated-from-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Filter Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Single Select</SelectItem>
                  <SelectItem value="multiselect">Multi Select</SelectItem>
                  <SelectItem value="range">Range (Min-Max)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "select" || formData.type === "multiselect" ? (
              <div className="space-y-2">
                <Label htmlFor="options">Options (one per line)</Label>
                <textarea
                  id="options"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  placeholder="Red&#10;Blue&#10;Green"
                  className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none transition-all duration-200 ease-out focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-border-strong"
                />
                <p className="text-xs text-secondary">Enter one option per line</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rangeMin">Min</Label>
                  <Input
                    id="rangeMin"
                    type="number"
                    value={formData.rangeMin}
                    onChange={(e) => setFormData({ ...formData, rangeMin: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeMax">Max</Label>
                  <Input
                    id="rangeMax"
                    type="number"
                    value={formData.rangeMax}
                    onChange={(e) => setFormData({ ...formData, rangeMax: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangeStep">Step</Label>
                  <Input
                    id="rangeStep"
                    type="number"
                    value={formData.rangeStep}
                    onChange={(e) => setFormData({ ...formData, rangeStep: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingFilterSet ? "Save Changes" : "Create Filter Set"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}