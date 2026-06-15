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
import { MoreHorizontal, Plus, Search, Pencil, Trash2, Upload, X, Ruler, Image as ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAdminSizeCharts } from "@/hooks"
import axios from "axios"
import { compressImage } from "@/lib/media"
import type { ISizeChartRow } from "@/lib/db/models/SizeChart"

interface FormData {
  name: string
  columns: string[]
  rows: ISizeChartRow[]
  allowCustomSize: boolean
  customSizeFields: string[]
  images: string[]
}

const DEFAULT_FORM: FormData = {
  name: "",
  columns: ["Size", "Chest", "Waist", "Length"],
  rows: [{ size: "", measurements: ["", "", "", ""] }],
  allowCustomSize: false,
  customSizeFields: ["Chest", "Waist", "Hip", "Shoulder Width", "Arm Length"],
  images: [],
}

const DEFAULT_CUSTOM_FIELDS = ["Chest", "Waist", "Hip", "Shoulder Width", "Arm Length", "Length"]

export default function AdminSizeChartsPage() {
  const { sizeCharts, isLoading, fetchSizeCharts, createSizeChart, updateSizeChart, deleteSizeChart } = useAdminSizeCharts()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChart, setEditingChart] = useState<{ id: string } | null>(null)
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")

  useEffect(() => {
    fetchSizeCharts()
  }, [fetchSizeCharts])

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM, rows: [{ size: "", measurements: ["", "", "", ""] }] })
    setEditingChart(null)
    setNewFieldName("")
  }

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      columns: formData.columns,
      rows: formData.rows.filter((r) => r.size.trim() !== ""),
      allowCustomSize: formData.allowCustomSize,
      customSizeFields: formData.allowCustomSize ? formData.customSizeFields.filter(f => f.trim() !== "") : [],
      images: formData.images,
      isActive: true,
    }

    if (editingChart) {
      await updateSizeChart(editingChart.id, payload)
    } else {
      await createSizeChart(payload)
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (chart: { _id: string; name: string; columns: string[]; rows: ISizeChartRow[]; isActive: boolean; allowCustomSize?: boolean; customSizeFields?: string[]; images?: string[] }) => {
    setEditingChart({ id: chart._id })
    setFormData({
      name: chart.name,
      columns: chart.columns.length > 0 ? chart.columns : DEFAULT_FORM.columns,
      rows: chart.rows.length > 0 ? chart.rows : [{ size: "", measurements: [""] }],
      allowCustomSize: chart.allowCustomSize || false,
      customSizeFields: chart.customSizeFields?.length ? chart.customSizeFields : [...DEFAULT_CUSTOM_FIELDS],
      images: chart.images || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this size chart?")) {
      await deleteSizeChart(id)
    }
  }

  // --- Column management ---
  const handleAddColumn = () => {
    const newCol = `Column ${formData.columns.length + 1}`
    setFormData({
      ...formData,
      columns: [...formData.columns, newCol],
      rows: formData.rows.map((row) => ({
        ...row,
        measurements: [...row.measurements, ""],
      })),
    })
  }

  const handleRemoveColumn = (index: number) => {
    setFormData({
      ...formData,
      columns: formData.columns.filter((_, i) => i !== index),
      rows: formData.rows.map((row) => ({
        ...row,
        measurements: row.measurements.filter((_, i) => i !== index),
      })),
    })
  }

  // --- Row management ---
  const handleAddRow = () => {
    setFormData({
      ...formData,
      rows: [...formData.rows, { size: "", measurements: formData.columns.map(() => "") }],
    })
  }

  const handleRemoveRow = (index: number) => {
    setFormData({
      ...formData,
      rows: formData.rows.filter((_, i) => i !== index),
    })
  }

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...formData.rows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      measurements: newRows[rowIndex].measurements.map((m, i) => (i === colIndex ? value : m)),
    }
    setFormData({ ...formData, rows: newRows })
  }

  const handleSizeChange = (rowIndex: number, value: string) => {
    const newRows = [...formData.rows]
    newRows[rowIndex] = { ...newRows[rowIndex], size: value }
    setFormData({ ...formData, rows: newRows })
  }

  // --- Custom size fields management ---
  const handleAddCustomField = () => {
    const name = newFieldName.trim()
    if (!name || formData.customSizeFields.includes(name)) return
    setFormData({
      ...formData,
      customSizeFields: [...formData.customSizeFields, name],
    })
    setNewFieldName("")
  }

  const handleRemoveCustomField = (index: number) => {
    setFormData({
      ...formData,
      customSizeFields: formData.customSizeFields.filter((_, i) => i !== index),
    })
  }

  // --- Image upload ---
  const handleImageUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setUploadingImage(true)
      try {
        const result = await compressImage(file, { maxWidthOrHeight: 1920, useWebP: true, maxSizeMB: 1 })
        const fd = new FormData()
        fd.append("file", result.file)
        const { data } = await axios.post("/api/uploads", fd)
        setFormData((prev) => ({ ...prev, images: [...prev.images, data.url] }))
      } catch (err) {
        console.error("Upload failed:", err)
      } finally {
        setUploadingImage(false)
      }
    }
    input.click()
  }

  const handleRemoveImage = async (index: number) => {
    const url = formData.images[index]
    try {
      await axios.delete(`/api/uploads/${encodeURIComponent(url)}`)
    } catch (err) {
      console.error("Delete failed:", err)
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const filteredCharts = sizeCharts.filter((chart) =>
    chart.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Size Charts</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Size Chart
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search size charts..."
          className="pl-9 sm:pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Size Charts Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Custom Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCharts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-secondary">
                  No size charts found
                </TableCell>
              </TableRow>
            ) : (
              filteredCharts.map((chart) => (
                <TableRow key={chart._id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(chart as unknown as { images?: string[] }).images?.length ? (
                        <ImageIcon className="h-4 w-4 text-accent" />
                      ) : null}
                      <p className="font-semibold">{chart.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary">
                    {chart.rows?.map(r => r.size).filter(Boolean).join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {(chart as unknown as { allowCustomSize?: boolean }).allowCustomSize ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        Enabled
                      </span>
                    ) : (
                      <span className="text-xs text-secondary">Disabled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        chart.isActive ? "bg-success-light text-success" : "bg-muted text-secondary"
                      }`}
                    >
                      {chart.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => handleEdit({
                          _id: chart._id.toString(),
                          name: chart.name,
                          columns: chart.columns,
                          rows: chart.rows,
                          isActive: chart.isActive,
                          allowCustomSize: (chart as unknown as { allowCustomSize?: boolean }).allowCustomSize,
                          customSizeFields: (chart as unknown as { customSizeFields?: string[] }).customSizeFields,
                          images: (chart as unknown as { images?: string[] }).images,
                        })}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-danger focus:text-danger"
                          onClick={() => handleDelete(chart._id.toString())}
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">{editingChart ? "Edit Size Chart" : "Add Size Chart"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">

            {/* Chart Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Chart Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Men's T-Shirts"
              />
            </div>

            {/* Size Guide Image(s) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Size Guide Image
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleImageUpload} disabled={uploadingImage}>
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
              <p className="text-xs text-muted">Upload an image showing how to measure (e.g., body measurement diagram)</p>
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden border border-border">
                      <img src={url} alt={`Size guide ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columns */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Columns (Measurements)</Label>
                <Button variant="outline" size="sm" onClick={handleAddColumn}>
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.columns.map((col, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={col}
                      onChange={(e) => {
                        const newCols = [...formData.columns]
                        newCols[index] = e.target.value
                        setFormData({ ...formData, columns: newCols })
                      }}
                      className="w-32"
                    />
                    {formData.columns.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveColumn(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sizes</Label>
                <Button variant="outline" size="sm" onClick={handleAddRow}>
                  <Plus className="h-4 w-4 mr-1" /> Add Size
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Size</TableHead>
                      {formData.columns.map((col, colIndex) => (
                        <TableHead key={colIndex}>
                          <span className="truncate">{col}</span>
                        </TableHead>
                      ))}
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>
                          <Input
                            value={row.size}
                            onChange={(e) => handleSizeChange(rowIndex, e.target.value)}
                            placeholder="e.g., S, M, L"
                          />
                        </TableCell>
                        {formData.columns.map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Input
                              value={row.measurements[colIndex] || ""}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              placeholder="-"
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          {formData.rows.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRow(rowIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Custom Size Section */}
            <div className="space-y-3 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-base">
                    <Ruler className="h-4 w-4" />
                    Allow Custom Size
                  </Label>
                  <p className="text-xs text-muted">
                    When enabled, customers can provide their own body measurements for a tailored fit
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCustomSize}
                    onChange={(e) => setFormData({ ...formData, allowCustomSize: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {formData.allowCustomSize && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className="text-sm">Custom Measurement Fields</Label>
                  <p className="text-xs text-muted">These fields will appear in the custom size form that customers fill out</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.customSizeFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-background-muted border border-border rounded-lg px-3 py-1.5"
                      >
                        <span className="text-sm">{field}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(index)}
                          className="ml-1 text-muted hover:text-danger transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Add field (e.g., Inseam)"
                      className="max-w-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCustomField()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} disabled={!newFieldName.trim()}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim() || formData.rows.every(r => !r.size.trim())}>
              {editingChart ? "Save Changes" : "Create Size Chart"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}