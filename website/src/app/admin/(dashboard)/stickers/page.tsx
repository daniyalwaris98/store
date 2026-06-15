"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { MoreHorizontal, Plus, Search, Pencil, Trash2, ImageIcon, Upload } from "lucide-react"
import axios from "axios"
import { compressImage } from "@/lib/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminStickers } from "@/hooks"
import type { StickerPlacement } from "@/lib/db/models/Sticker"

const PLACEMENT_LABELS: Record<StickerPlacement, string> = {
  "top-left": "Top Left",
  "top-right": "Top Right",
  "top-center": "Top Center",
  "center-left": "Center Left",
  "center": "Center",
  "center-right": "Center Right",
  "bottom-left": "Bottom Left",
  "bottom-right": "Bottom Right",
  "bottom-center": "Bottom Center",
}

export default function AdminStickersPage() {
  const { stickers, isLoading, error, fetchStickers, createSticker, updateSticker, deleteSticker } = useAdminStickers()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSticker, setEditingSticker] = useState<{ id: string; name: string; imageUrl: string; placement: StickerPlacement; isActive: boolean } | null>(null)
  const [editingOriginalImageUrl, setEditingOriginalImageUrl] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    placement: "top-right" as StickerPlacement,
    isActive: true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchStickers()
  }, [fetchStickers])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const result = await compressImage(file, { maxWidthOrHeight: 800, useWebP: true, maxSizeMB: 1 })
      const formData = new FormData()
      formData.append("file", result.file)
      const { data } = await axios.post("/api/uploads", formData)
      setFormData((prev) => ({ ...prev, imageUrl: data.url }))
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (editingSticker && formData.imageUrl !== editingOriginalImageUrl && editingOriginalImageUrl) {
      try {
        await axios.delete(`/api/uploads/${encodeURIComponent(editingOriginalImageUrl)}`)
      } catch (err) {
        console.error("Failed to delete old image:", err)
      }
    }
    if (editingSticker) {
      await updateSticker(editingSticker.id, formData)
    } else {
      await createSticker(formData)
    }
    setIsDialogOpen(false)
    setEditingSticker(null)
    setEditingOriginalImageUrl("")
    setFormData({ name: "", imageUrl: "", placement: "top-right", isActive: true })
  }

  const handleCloseDialog = async () => {
    if (editingSticker && formData.imageUrl !== editingOriginalImageUrl) {
      try {
        await axios.delete(`/api/uploads/${encodeURIComponent(formData.imageUrl)}`)
      } catch (err) {
        console.error("Failed to delete uploaded asset:", err)
      }
    }
    setIsDialogOpen(false)
    setEditingSticker(null)
    setEditingOriginalImageUrl("")
    setFormData({ name: "", imageUrl: "", placement: "top-right", isActive: true })
  }

  const handleNewSticker = () => {
    setEditingSticker(null)
    setEditingOriginalImageUrl("")
    setFormData({ name: "", imageUrl: "", placement: "top-right", isActive: true })
    setIsDialogOpen(true)
  }

  const handleEdit = (sticker: { _id: string; name: string; imageUrl: string; placement: StickerPlacement; isActive: boolean }) => {
    setEditingSticker({ id: sticker._id, name: sticker.name, imageUrl: sticker.imageUrl, placement: sticker.placement, isActive: sticker.isActive })
    setEditingOriginalImageUrl(sticker.imageUrl)
    setFormData({
      name: sticker.name,
      imageUrl: sticker.imageUrl,
      placement: sticker.placement,
      isActive: sticker.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sticker?")) {
      await deleteSticker(id)
    }
  }

  const filteredStickers = stickers.filter((sticker) =>
    sticker.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Stickers</h1>
        <Button onClick={handleNewSticker}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sticker
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search stickers..."
          className="pl-9 sm:pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stickers Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Sticker</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredStickers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-secondary">
                  No stickers found
                </TableCell>
              </TableRow>
            ) : (
              filteredStickers.map((sticker) => (
                <TableRow key={sticker._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-background-muted border border-border rounded-lg overflow-hidden flex items-center justify-center">
                        {sticker.imageUrl ? (
                          <img
                            src={sticker.imageUrl}
                            alt={sticker.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted" />
                        )}
                      </div>
                      <p className="font-semibold">{sticker.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary">
                    {PLACEMENT_LABELS[sticker.placement]}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        sticker.isActive
                          ? "bg-success-light text-success"
                          : "bg-muted text-secondary"
                      }`}
                    >
                      {sticker.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => handleEdit(sticker)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-danger focus:text-danger"
                          onClick={() => handleDelete(sticker._id)}
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">{editingSticker ? "Edit Sticker" : "Add Sticker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sale, New, Hot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="flex-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadingImage ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement">Placement</Label>
              <Select
                value={formData.placement}
                onValueChange={(value) => setFormData({ ...formData, placement: value as StickerPlacement })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSticker ? "Save Changes" : "Create Sticker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}