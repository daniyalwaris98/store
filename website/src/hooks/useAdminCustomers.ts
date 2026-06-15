"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { Customer, CustomerListResponse } from "@/types"

interface CustomerQueryParams {
  search?: string
  page?: number
  limit?: number
}

interface UseAdminCustomersState {
  customers: Customer[]
  pagination: CustomerListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useAdminCustomers() {
  const [state, setState] = useState<UseAdminCustomersState>({
    customers: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchCustomers = useCallback(async (params: CustomerQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<CustomerListResponse>("/api/customers", {
        params,
      })
      setState({
        customers: data.customers,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch customers"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const updateCustomer = useCallback(async (id: string, input: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.put<Customer>(`/api/customers/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        customers: prev.customers.map((c) => (c._id === id ? data : c)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update customer"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const deleteCustomer = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      await axios.delete(`/api/customers/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        customers: prev.customers.filter((c) => c._id !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete customer"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return { ...state, fetchCustomers, updateCustomer, deleteCustomer }
}