"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { Collection, CreateOrderInput } from "@/types"

interface CreateCollectionInput {
  name: string
  description?: string
  image?: string
  parent?: string
  order?: number
  filters?: string[]
  status?: "active" | "archived"
  showInMenu?: boolean
}

interface UpdateCollectionInput {
  name?: string
  description?: string
  image?: string
  parent?: string
  order?: number
  filters?: string[]
  status?: "active" | "archived"
  showInMenu?: boolean
}

interface UseAdminCollectionsState {
  collections: Collection[]
  isLoading: boolean
  error: string | null
}

export function useAdminCollections() {
  const [state, setState] = useState<UseAdminCollectionsState>({
    collections: [],
    isLoading: false,
    error: null,
  })

  const fetchCollections = useCallback(async (params: { search?: string } = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<Collection[]>("/api/collections", { params })
      setState({ collections: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch collections"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createCollection = useCallback(async (input: CreateCollectionInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<Collection>("/api/collections", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        collections: [...prev.collections, data],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create collection"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw new Error(message)
    }
  }, [])

  const updateCollection = useCallback(
    async (id: string, input: UpdateCollectionInput) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const { data } = await axios.put<Collection>(`/api/collections/${id}`, input)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          collections: prev.collections.map((c) => (c._id === id ? data : c)),
        }))
        return data
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to update collection"
          : "An unexpected error occurred"
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
        throw new Error(message)
      }
    },
    []
  )

  const deleteCollection = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await axios.delete(`/api/collections/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        collections: prev.collections.filter((c) => c._id !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete collection"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return {
    ...state,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
  }
}