"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Star, Search, CheckCircle, XCircle, ThumbsUp, Plus, Upload, X } from "lucide-react"
import axios from "axios"
import { compressImage } from "@/lib/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminReviews, useDebounce } from "@/hooks"
import type { Review, ReviewStatus } from "@/types"

const STATUS_OPTIONS = [
  { value: "all", label: "All Reviews" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-warning-light text-warning",
  approved: "bg-success-light text-success",
  rejected: "bg-danger-light text-danger",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-primary text-primary" : "text-muted"}`}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const { reviews, pagination, isLoading, fetchReviews, approveReview, rejectReview, createReview } = useAdminReviews()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 500)

  // Create review form state
  const [createForm, setCreateForm] = useState({
    rating: 5,
    title: "",
    body: "",
    images: [] as string[],
    customer: "",
    verified: false,
    featured: true,
  })
  const [createError, setCreateError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const params: { status?: string; search?: string; page?: number; limit?: number } = { limit: 50 }
    if (statusFilter !== "all") {
      params.status = statusFilter
    }
    if (debouncedSearch) {
      params.search = debouncedSearch
    }
    fetchReviews(params)
  }, [statusFilter, debouncedSearch, fetchReviews])

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId)
    await approveReview(reviewId)
    setActionLoading(null)
  }

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId)
    await rejectReview(reviewId)
    setActionLoading(null)
  }

  const openReviewDetail = (review: Review) => {
    setSelectedReview(review)
    setIsDetailDialogOpen(true)
  }

  const handleCreateReview = async () => {
    if (!createForm.title || !createForm.body) {
      setCreateError("Title and body are required")
      return
    }
    setIsCreating(true)
    setCreateError("")

    const result = await createReview({
      rating: createForm.rating,
      title: createForm.title,
      body: createForm.body,
      images: createForm.images.length > 0 ? createForm.images : undefined,
      customer: createForm.customer || undefined,
      verified: createForm.verified,
      featured: createForm.featured,
    })

    setIsCreating(false)

    if (result) {
      setIsCreateDialogOpen(false)
      setCreateForm({
        rating: 5,
        title: "",
        body: "",
        images: [],
        customer: "",
        verified: false,
        featured: true,
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const newImages: string[] = []
      for (const file of Array.from(files)) {
        const processed = await compressImage(file)
        const fd = new FormData()
        fd.append("file", processed.file)
        const { data } = await axios.post("/api/uploads", fd)
        newImages.push(data.url)
      }
      setCreateForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = createForm.images[index]
    try {
      await axios.delete(`/api/uploads/${encodeURIComponent(imageUrl)}`)
    } catch (err) {
      console.error("Failed to delete image:", err)
    }
    setCreateForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const filteredReviews = reviews.filter((review) => {
    if (statusFilter !== "all" && review.status !== statusFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        review.title.toLowerCase().includes(searchLower) ||
        review.body.toLowerCase().includes(searchLower) ||
        (review.customer || "")?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const pendingCount = reviews.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-secondary mt-1">
            {pendingCount > 0 ? `${pendingCount} review${pendingCount > 1 ? "s" : ""} awaiting moderation` : "Manage product reviews"}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Review
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <TabsList className="flex flex-wrap">
          {STATUS_OPTIONS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.value === "pending" && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-warning-light text-warning text-xs font-medium">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search reviews..."
          className="pl-9 sm:pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Reviews Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Review</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-12 bg-linear-to-br from-muted to-muted/70 animate-pulse rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-secondary">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <button
                      onClick={() => openReviewDetail(review)}
                      className="text-left hover:underline"
                    >
                      <p className="font-semibold line-clamp-1">{review.title}</p>
                      <p className="text-sm text-secondary line-clamp-2">{review.body}</p>
                    </button>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {review.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="w-10 h-10 rounded-lg bg-background-muted border border-border overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {review.images.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-background-muted border border-border flex items-center justify-center text-xs font-medium">
                            +{review.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-secondary font-mono">{review.product?.slice(-8) || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-secondary">
                      {review.customer || "Anonymous"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-secondary">{formatDate(review.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[review.status]}`}>
                      {review.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {review.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:text-success hover:bg-success-light"
                          onClick={() => handleApprove(review._id)}
                          disabled={actionLoading === review._id}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:text-danger hover:bg-danger-light"
                          onClick={() => handleReject(review._id)}
                          disabled={actionLoading === review._id}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {review.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openReviewDetail(review)}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews({ page: pagination.page - 1, limit: 50, ...(statusFilter !== "all" && { status: statusFilter }) })}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews({ page: pagination.page + 1, limit: 50, ...(statusFilter !== "all" && { status: statusFilter }) })}
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-4">
              {/* Rating & Status */}
              <div className="flex items-center justify-between">
                <StarRating rating={selectedReview.rating} />
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedReview.status]}`}>
                  {selectedReview.status}
                </span>
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="font-semibold text-lg">{selectedReview.title}</h3>
                <p className="text-secondary mt-2">{selectedReview.body}</p>
              </div>

              {/* Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <Label className="text-sm text-secondary">Images</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedReview.images.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg bg-background-muted border border-border overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="text-sm text-secondary space-y-1">
                <p>Product ID: <span className="font-mono">{selectedReview.product || "—"}</span></p>
                <p>Customer: {selectedReview.customer || "Anonymous"}</p>
                <p>Submitted: {formatDate(selectedReview.createdAt)}</p>
                {selectedReview.verified && (
                  <p className="text-success flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Verified Purchase
                  </p>
                )}
                {selectedReview.helpful > 0 && (
                  <p className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" /> {selectedReview.helpful} found helpful
                  </p>
                )}
              </div>

              {/* Actions for pending */}
              {selectedReview.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      handleApprove(selectedReview._id)
                      setIsDetailDialogOpen(false)
                    }}
                    disabled={actionLoading === selectedReview._id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedReview._id)
                      setIsDetailDialogOpen(false)
                    }}
                    disabled={actionLoading === selectedReview._id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Review Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Create Featured Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, rating: star }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= createForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Review title"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="create-body">Body</Label>
              <Textarea
                id="create-body"
                value={createForm.body}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Review content"
                rows={4}
              />
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="create-customer">Customer Name (optional)</Label>
              <Input
                id="create-customer"
                value={createForm.customer}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customer: e.target.value }))}
                placeholder="Customer name"
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-border-strong transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                  id="create-image-upload"
                />
                <label
                  htmlFor="create-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-secondary" />
                  <span className="text-sm text-secondary">
                    {isUploading ? "Uploading..." : "Click to upload images"}
                  </span>
                </label>
              </div>
              {createForm.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {createForm.images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="create-verified"
                  checked={createForm.verified}
                  onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, verified: checked }))}
                />
                <Label htmlFor="create-verified" className="text-sm font-normal">Verified Purchase</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="create-featured"
                  checked={createForm.featured}
                  onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="create-featured" className="text-sm font-normal">Featured</Label>
              </div>
            </div>

            {createError && <p className="text-sm text-danger">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReview} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}