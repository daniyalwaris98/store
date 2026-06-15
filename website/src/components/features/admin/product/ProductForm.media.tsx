"use client"

import { Upload, ImageIcon, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { IGalleryItem } from "@/lib/db/models/Product"
import { compressImage, isVideoFile } from "@/lib/media"
import axios from "axios"

interface MediaSectionProps {
  gallery: IGalleryItem[]
  uploadingCount: number
  deletingIndex: number | null
  dragOverIndex: number | null
  onAddMedia: () => void
  onRemoveMedia: (index: number) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, dropIndex: number) => void
  onDragEnd: () => void
  setGallery: React.Dispatch<React.SetStateAction<IGalleryItem[]>>
}

export function MediaSection({
  gallery,
  uploadingCount,
  deletingIndex,
  dragOverIndex,
  onAddMedia,
  onRemoveMedia,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: MediaSectionProps) {
  return (
    <div className="space-y-3">
      {gallery.length === 0 && uploadingCount === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
          onClick={onAddMedia}
        >
          <ImageIcon className="h-8 w-8 mx-auto text-muted mb-2" />
          <p className="text-sm font-medium text-secondary">Add media</p>
          <p className="text-[11px] text-muted mt-0.5">Drag or click to upload images and videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {gallery.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className={`relative aspect-square bg-background-muted rounded-md overflow-hidden group cursor-grab active:cursor-grabbing border ${
                dragOverIndex === index ? "border-accent border-2" : "border-border"
              } ${index === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
              {deletingIndex === index && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveMedia(index)
                }}
                disabled={deletingIndex === index}
                className="absolute top-1 right-1 bg-foreground/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-danger hover:scale-110 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-foreground/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                  COVER
                </div>
              )}
            </div>
          ))}
          <div
            className="aspect-square border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
            onClick={onAddMedia}
          >
            <Plus className="h-5 w-5 text-muted" />
          </div>
        </div>
      )}
    </div>
  )
}

export function useMediaUpload(
  setGallery: React.Dispatch<React.SetStateAction<IGalleryItem[]>>,
  setUploadingCount: React.Dispatch<React.SetStateAction<number>>
) {
  const handleAddMedia = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files?.length) return
      setUploadingCount(files.length)

      for (const file of files) {
        try {
          let f = file
          if (!isVideoFile(file)) {
            const result = await compressImage(file, { maxWidthOrHeight: 1920, useWebP: true, maxSizeMB: 1 })
            f = result.file
          }
          const fd = new FormData()
          fd.append("file", f)
          const { data } = await axios.post("/api/uploads", fd)
          setGallery((prev) => [...prev, { url: data.url, type: data.type === "video" ? "video" : "image", order: prev.length }])
        } catch (err) {
          console.error("Upload failed:", err)
        }
      }
      setUploadingCount(0)
    }
    input.click()
  }

  return { handleAddMedia }
}