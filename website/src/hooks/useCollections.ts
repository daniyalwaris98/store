"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { Collection } from "@/types"

interface UseCollectionsState {
  collections: Collection[]
  isLoading: boolean
  error: string | null
}

export function useCollections() {
  const [state, setState] = useState<UseCollectionsState>({
    collections: [],
    isLoading: false,
    error: null,
  })

  const fetchCollections = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<Collection[]>("/api/collections")
      setState({ collections: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch collections"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  return { ...state, fetchCollections }
}