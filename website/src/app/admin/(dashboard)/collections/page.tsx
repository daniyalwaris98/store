"use client"

import { useEffect, useState } from "react"
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
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAdminCollections, useDebounce } from "@/hooks"

export default function AdminCollectionsPage() {
  const router = useRouter()
  const { collections, isLoading, fetchCollections, deleteCollection, updateCollection } = useAdminCollections()
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    const params: Record<string, unknown> = {}
    if (debouncedSearch) params.search = debouncedSearch
    fetchCollections(params)
  }, [debouncedSearch, fetchCollections])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await deleteCollection(id)
    }
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
    if (selectedIds.size === collections.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(collections.map((c) => c._id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected collections?`)) return
    for (const id of selectedIds) {
      await deleteCollection(id)
    }
    setSelectedIds(new Set())
  }

  const handleBulkStatusChange = async (status: "active" | "archived") => {
    for (const id of selectedIds) {
      await updateCollection(id, { status })
    }
    setSelectedIds(new Set())
    fetchCollections()
  }

  const allSelected = collections.length > 0 && selectedIds.size === collections.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Collections</h1>
          <p className="text-xs text-secondary mt-0.5">
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/collections/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add collection
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        <Input
          placeholder="Search collections..."
          className="pl-8 sm:pl-8 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
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
              onClick={() => handleBulkStatusChange("archived")}
            >
              <Archive className="h-3 w-3 mr-1" /> Archive
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

      {/* Collections Table */}
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
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Collection</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Slug</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Products</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="p-2">
                      <div className="h-10 bg-background-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Layers className="h-10 w-10 mx-auto text-muted mb-3" />
                    <p className="text-sm font-medium text-secondary">No collections found</p>
                    <p className="text-xs text-muted mt-1">
                      <Link href="/admin/collections/new" className="text-accent hover:underline">
                        Create your first collection
                      </Link>
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow
                    key={collection._id}
                    className="group cursor-pointer hover:bg-background-subtle/50 transition-colors"
                    onClick={() => router.push(`/admin/collections/${collection._id}`)}
                  >
                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(collection._id)}
                        onChange={() => toggleSelect(collection._id)}
                        className="rounded cursor-pointer accent-accent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 bg-background-muted border border-border rounded-md overflow-hidden flex-shrink-0">
                          {collection.image ? (
                            <img
                              src={collection.image}
                              alt={collection.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Layers className="h-4 w-4 text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[200px]">{collection.name}</p>
                          {collection.description && (
                            <p className="text-[11px] text-muted truncate max-w-[200px]">{collection.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs font-mono text-secondary">{collection.slug}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs font-medium">
                        {(collection as any).productCount || (collection as any).products?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${collection.status === "active" ? "bg-success-light text-success" : "bg-muted text-secondary"}`}>
                        {collection.status === "active" ? "Active" : "Archived"}
                      </span>
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
                            <Link href={`/admin/collections/${collection._id}`}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-danger focus:text-danger"
                            onClick={() => handleDelete(collection._id)}
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
    </div>
  )
}