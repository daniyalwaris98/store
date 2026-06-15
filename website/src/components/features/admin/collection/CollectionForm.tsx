"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Upload,
  ImageIcon,
  X,
  Trash2,
} from "lucide-react"
import { useAdminCollections } from "@/hooks"
import { useToast } from "@/context/ToastContext"
import axios from "axios"
import { compressImage } from "@/lib/media"
import type { CreateCollectionInput, UpdateCollectionInput } from "@/lib/validators/collection"
import type { ICollection } from "@/lib/db/models/Collection"

// ============================================================================
// SECTION CARD
// ============================================================================

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-card-bg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-card-bg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

// ============================================================================
// TYPES
// ============================================================================

interface CollectionFormProps {
  mode: "create" | "edit"
  collectionId?: string
}

// ============================================================================
// MAIN FORM
// ============================================================================

export default function CollectionForm({ mode, collectionId }: CollectionFormProps) {
  const router = useRouter()
  const { collections, fetchCollections, createCollection, updateCollection, deleteCollection, isLoading } = useAdminCollections()
  const toast = useToast()

  const [isLoadingCollection, setIsLoadingCollection] = useState(mode === "edit")
  const [isSaving, setIsSaving] = useState(false)

  // Form data
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [parent, setParent] = useState("")
  const [order, setOrder] = useState("0")
  const [status, setStatus] = useState<"active" | "archived">("active")
  const [showInMenu, setShowInMenu] = useState(true)

  const [error, setError] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)

  // ---- Fetch collections for parent selector ----
  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  // ---- Load collection for edit ----
  useEffect(() => {
    if (mode !== "edit" || !collectionId) return

    const loadCollection = async () => {
      try {
        const { data } = await axios.get<ICollection>(`/api/collections/${collectionId}`)
        setName(data.name || "")
        setSlug(data.slug || "")
        setDescription(data.description || "")
        setImage(data.image || "")
        setParent(data.parent?.toString() || "")
        setOrder(data.order?.toString() || "0")
        setStatus(data.status || "active")
        setShowInMenu(!!data.showInMenu)
        setSlugManual(true)
      } catch {
        setError("Failed to load collection")
      } finally {
        setIsLoadingCollection(false)
      }
    }

    loadCollection()
  }, [mode, collectionId])

  // ---- Name → Slug ----
  const generateSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const handleNameChange = (n: string) => {
    setName(n)
    if (!slugManual) setSlug(generateSlug(n))
  }

  // ---- Image upload ----
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const result = await compressImage(file, { maxWidthOrHeight: 1920, useWebP: true, maxSizeMB: 1 })
      const fd = new FormData()
      fd.append("file", result.file)
      const { data } = await axios.post("/api/uploads", fd)
      setImage(data.url)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploadingImage(false)
    }
  }

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    if (!name) {
      setError("Collection name is required")
      setIsSaving(false)
      return
    }

    const payload: CreateCollectionInput | UpdateCollectionInput = {
      name,
      description: description || undefined,
      image: image || undefined,
      parent: parent && parent !== "none" ? parent : undefined,
      order: order ? parseInt(order) : 0,
      status,
      showInMenu,
    }

    try {
      if (mode === "create") {
        const result = await createCollection(payload as CreateCollectionInput)
        if (result) {
          toast({ description: "Collection created" })
          router.push(`/admin/collections/${result._id}`)
        }
      } else if (collectionId) {
        await updateCollection(collectionId, payload as UpdateCollectionInput)
        toast({ description: "Collection saved" })
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : `Failed to ${mode === "create" ? "create" : "save"} collection`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!collectionId) return
    if (confirm("Delete this collection? This action cannot be undone.")) {
      const success = await deleteCollection(collectionId)
      if (success) {
        toast({ description: "Collection deleted" })
        router.push("/admin/collections")
      }
    }
  }

  const handleRemoveImage = async () => {
    if (image) {
      setDeletingImage(true)
      try {
        await axios.delete(`/api/uploads/${encodeURIComponent(image)}`)
      } catch (err) {
        console.error("Failed to delete asset:", err)
      }
    }
    setImage("")
    setDeletingImage(false)
  }

  // ---- Loading ----
  if (isLoadingCollection) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/collections"
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-background-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold leading-tight">
            {mode === "create" ? "Add collection" : name || "Edit collection"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-danger hover:text-danger" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push("/admin/collections")}>
            Discard
          </Button>
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={isSaving || isLoading}>
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? "Saving..." : mode === "create" ? "Save collection" : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-xs px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard title="Collection details">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Summer Collection"
                  className="h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL handle</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true)
                    setSlug(e.target.value)
                  }}
                  placeholder="summer-collection"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
          </SectionCard>

          {/* Image */}
          <SectionCard title="Image">
            {image ? (
              <div className="relative w-full max-w-xs">
                <div className="aspect-video bg-background-muted rounded-lg overflow-hidden border border-border">
                  <img src={image} alt="Collection" className="w-full h-full object-cover" />
                  {deletingImage && (
                    <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={deletingImage}
                  className="absolute top-2 right-2 bg-foreground/80 text-white rounded-full p-1 hover:bg-danger hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingImage ? (
                    <div className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="collection-image"
                  onChange={handleImageUpload}
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  onClick={() => document.getElementById("collection-image")?.click()}
                >
                  <ImageIcon className="h-8 w-8 mx-auto text-muted mb-2" />
                  <p className="text-sm font-medium text-secondary">
                    {uploadingImage ? "Uploading..." : "Add collection image"}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">Click to upload or paste a URL</p>
                </div>
                <div className="mt-2">
                  <Input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
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
                <SelectItem value="archived">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted" /> Archived
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </SidebarCard>

          <SidebarCard title="Visibility">
            <button
              type="button"
              role="switch"
              aria-checked={showInMenu}
              onClick={() => setShowInMenu((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                showInMenu ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  showInMenu ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <p className="text-xs font-medium mt-2">
              {showInMenu ? "Shown in menu" : "Hidden from menu"}
            </p>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              {showInMenu
                ? "This collection appears in the header navigation."
                : "This collection is active but won't appear in the header menu (e.g. Featured, Sale)."}
            </p>
          </SidebarCard>

          <SidebarCard title="Organization">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Parent collection</Label>
                <Select value={parent || "none"} onValueChange={setParent}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {collections
                      .filter((c) => c._id !== collectionId)
                      .map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sort order</Label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0"
                />
              </div>
            </div>
          </SidebarCard>

          {/* SEO Preview */}
          <SidebarCard title="SEO Preview">
            <div className="p-2 bg-background-subtle rounded-md">
              <p className="text-[10px] text-success truncate">yourstore.com/collections/{slug || "..."}</p>
              <p className="text-xs font-medium mt-0.5 truncate">{name || "Collection title"}</p>
              <p className="text-[10px] text-muted line-clamp-2 mt-0.5">
                {description?.substring(0, 120) || "Description preview..."}
              </p>
            </div>
          </SidebarCard>
        </div>
      </div>
    </form>
  )
}
