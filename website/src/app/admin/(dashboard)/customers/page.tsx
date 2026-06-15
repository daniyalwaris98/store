"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MoreHorizontal, Search, Eye, Pencil, Trash2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useAdminCustomers, useDebounce } from "@/hooks"
import type { Customer } from "@/types"

export default function AdminCustomersPage() {
  const { customers, pagination, isLoading, error, fetchCustomers, updateCustomer, deleteCustomer } = useAdminCustomers()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "" })
  const [editLoading, setEditLoading] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState({ email: "", name: "", phone: "" })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    fetchCustomers({ search: debouncedSearch || undefined })
  }, [debouncedSearch, fetchCustomers])

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer)
    setEditForm({ name: customer.name || "", phone: customer.phone || "" })
  }

  const handleSaveEdit = async () => {
    if (!editCustomer) return
    setEditLoading(true)
    const result = await updateCustomer(editCustomer._id, editForm)
    setEditLoading(false)
    if (result) {
      setEditCustomer(null)
      fetchCustomers({ search: debouncedSearch || undefined })
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (confirm(`Delete customer "${customer.name || customer.email}"? This cannot be undone.`)) {
      await deleteCustomer(customer._id)
    }
  }

  const handleAddCustomer = async () => {
    if (!addForm.email) return
    setAddLoading(true)
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })
      setAddDialogOpen(false)
      setAddForm({ email: "", name: "", phone: "" })
      fetchCustomers({ search: debouncedSearch || undefined })
    } catch (e) {
      console.error(e)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="pl-9 sm:pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customers Table */}
      <div className="border border-border rounded-xl overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
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
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-secondary">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <p className="font-semibold">{customer.name || "Guest"}</p>
                    <p className="text-sm text-secondary">
                      {customer.addresses?.length || 0} addresses
                    </p>
                  </TableCell>
                  <TableCell className="text-secondary">{customer.email}</TableCell>
                  <TableCell className="text-secondary">{customer.phone || "-"}</TableCell>
                  <TableCell className="text-secondary font-medium">{customer.orderCount || 0}</TableCell>
                  <TableCell className="text-secondary">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(customer)}
                          className="text-destructive focus:text-destructive"
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-secondary">
          Showing {customers.length} of {pagination.total} customers
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => fetchCustomers({ page: pagination.page - 1, search: debouncedSearch || undefined })}
          >
            Previous
          </Button>
          <Button variant="outline" disabled>
            {pagination.page}
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchCustomers({ page: pagination.page + 1, search: debouncedSearch || undefined })}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={addLoading || !addForm.email}>
              {addLoading ? "Creating..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}