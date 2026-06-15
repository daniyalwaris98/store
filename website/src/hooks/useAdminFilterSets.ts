"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { IFilterSet } from "@/lib/db/models/FilterSet"

interface CreateFilterSetInput {
  name: string
  slug: string
  type: "select" | "multiselect" | "range"
  options?: string[]
  rangeMin?: number
  rangeMax?: number
  rangeStep?: number
  isActive?: boolean
}

interface UpdateFilterSetInput {
  name?: string
  slug?: string
  type?: "select" | "multiselect" | "range"
  options?: string[]
  rangeMin?: number
  rangeMax?: number
  rangeStep?: number
  isActive?: boolean
}

interface UseAdminFilterSetsState {
  filterSets: IFilterSet[]
  isLoading: boolean
  error: string | null
}

export function useAdminFilterSets() {
  const [state, setState] = useState<UseAdminFilterSetsState>({
    filterSets: [],
    isLoading: false,
    error: null,
  })

  const fetchFilterSets = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<IFilterSet[]>("/api/filter-sets")
      setState({ filterSets: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch filter sets"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createFilterSet = useCallback(async (input: CreateFilterSetInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<IFilterSet>("/api/filter-sets", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        filterSets: [data, ...prev.filterSets],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create filter set"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw new Error(message)
    }
  }, [])

  const updateFilterSet = useCallback(async (id: string, input: UpdateFilterSetInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.put<IFilterSet>(`/api/filter-sets/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        filterSets: prev.filterSets.map((f) => (f._id.toString() === id ? data : f)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update filter set"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw new Error(message)
    }
  }, [])

  const deleteFilterSet = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await axios.delete(`/api/filter-sets/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        filterSets: prev.filterSets.filter((f) => f._id.toString() !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete filter set"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return { ...state, fetchFilterSets, createFilterSet, updateFilterSet, deleteFilterSet }
}