"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Archive,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
} from "lucide-react"
import axios from "axios"
import { useAdminProducts, useAdminCollections, useDebounce } from "@/hooks"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

export default function AdminProductsPage() {
  const router = useRouter()
  const { products, pagination, isLoading, fetchProducts, deleteProduct, createProduct, updateProduct } = useAdminProducts()
  const { collections, fetchCollections } = useAdminCollections()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [collectionFilter, setCollectionFilter] = useState<string>("all-collections")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)

  const loadProducts = useCallback((page: number = 1) => {
    const params: Record<string, unknown> = { page }
    if (debouncedSearch) params.search = debouncedSearch
    if (statusFilter !== "all") params.status = statusFilter
    if (collectionFilter !== "all-collections") params.collection = collectionFilter
    fetchProducts(params)
  }, [debouncedSearch, statusFilter, collectionFilter, fetchProducts])

  useEffect(() => {
    setCurrentPage(1)
    loadProducts(1)
    fetchCollections()
  }, [debouncedSearch, statusFilter, collectionFilter, loadProducts, fetchCollections])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadProducts(page)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const { data: fullProduct } = await axios.get<Product>(`/api/products/${id}`)
      const { _id, slug, createdAt, updatedAt, ...rest } = fullProduct
      await createProduct({
        ...rest,
        name: `${fullProduct.name} (Copy)`,
        sku: `SKU-${Date.now()}`,
        status: "draft" as const,
      })
      loadProducts(currentPage)
    } catch (err) {
      console.error("Failed to duplicate product:", err)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected products?`)) return
    for (const id of selectedIds) {
      await deleteProduct(id)
    }
    setSelectedIds(new Set())
  }

  const handleBulkStatusChange = async (status: "active" | "draft" | "archived") => {
    for (const id of selectedIds) {
      await updateProduct(id, { status })
    }
    setSelectedIds(new Set())
    loadProducts(currentPage)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)))
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-success-light text-success",
      draft: "bg-warning-light text-warning",
      archived: "bg-muted text-secondary",
    }
    return map[status] || map.draft
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Products</h1>
          <p className="text-xs text-secondary mt-0.5">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add product
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            placeholder="Search products..."
            className="pl-8 sm:pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-collections">All collections</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
          <span className="text-xs font-medium text-accent">{selectedIds.size} selected</span>
          <div className="flex gap-1 ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => handleBulkStatusChange("active")}
            >
              <Eye className="h-3 w-3 mr-1" /> Set active
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => handleBulkStatusChange("draft")}
            >
              <Archive className="h-3 w-3 mr-1" /> Set draft
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2 text-danger hover:text-danger"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-background-subtle">
                <TableHead className="w-10 px-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer accent-accent"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Product</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Inventory</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary text-right">Price</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="p-2">
                      <div className="h-10 bg-background-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Package className="h-10 w-10 mx-auto text-muted mb-3" />
                    <p className="text-sm font-medium text-secondary">No products found</p>
                    <p className="text-xs text-muted mt-1">
                      Try adjusting your filters or{" "}
                      <Link href="/admin/products/new" className="text-accent hover:underline">
                        add a new product
                      </Link>
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product._id}
                    className="group cursor-pointer hover:bg-background-subtle/50 transition-colors"
                    onClick={() => router.push(`/admin/products/${product._id}`)}
                  >
                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="rounded cursor-pointer accent-accent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 bg-background-muted border border-border rounded-md overflow-hidden flex-shrink-0">
                          {product.gallery?.[0] ? (
                            <img
                              src={product.gallery[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[200px] lg:max-w-[300px]">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${statusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      {product.inventory === 0 ? (
                        <span className="text-danger text-xs font-medium">Out of stock</span>
                      ) : product.inventory != null ? (
                        <span className="text-xs font-medium">{product.inventory} in stock</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div>
                        <span className="text-sm font-semibold">{formatCurrency(product.salePrice, product.currency || "USD")}</span>
                        {product.originalPrice && product.originalPrice > product.salePrice && (
                          <span className="text-xs text-muted line-through ml-1.5">
                            {formatCurrency(product.originalPrice, product.currency || "USD")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product._id}`}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(product._id)}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-danger focus:text-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
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
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-secondary">
            Page {currentPage} of {pagination.pages} · {pagination.total} products
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              let pageNum: number
              if (pagination.pages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage >= pagination.pages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
