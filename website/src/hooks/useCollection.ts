"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { CollectionWithProducts } from "@/types"

interface UseCollectionState {
  collection: CollectionWithProducts | null
  isLoading: boolean
  error: string | null
}

export function useCollection(slug?: string) {
  const [state, setState] = useState<UseCollectionState>({
    collection: null,
    isLoading: false,
    error: null,
  })

  const fetchCollection = useCallback(async (collectionSlug?: string) => {
    const targetSlug = collectionSlug || slug
    if (!targetSlug) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<CollectionWithProducts>(
        `/api/collections/${targetSlug}?include=products`
      )
      setState({ collection: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Collection not found"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [slug])

  return { ...state, fetchCollection }
}