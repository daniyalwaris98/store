"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { StickerPlacement } from "@/lib/db/models/Sticker"

interface Sticker {
  _id: string
  name: string
  imageUrl: string
  placement: StickerPlacement
  isActive: boolean
  createdAt: string
}

interface CreateStickerInput {
  name: string
  imageUrl: string
  placement: StickerPlacement
  isActive?: boolean
}

interface UpdateStickerInput {
  name?: string
  imageUrl?: string
  placement?: StickerPlacement
  isActive?: boolean
}

interface UseAdminStickersState {
  stickers: Sticker[]
  isLoading: boolean
  error: string | null
}

export function useAdminStickers() {
  const [state, setState] = useState<UseAdminStickersState>({
    stickers: [],
    isLoading: false,
    error: null,
  })

  const fetchStickers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<Sticker[]>("/api/stickers")
      setState({ stickers: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch stickers"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createSticker = useCallback(async (input: CreateStickerInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<Sticker>("/api/stickers", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        stickers: [data, ...prev.stickers],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create sticker"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const updateSticker = useCallback(async (id: string, input: UpdateStickerInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.put<Sticker>(`/api/stickers/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        stickers: prev.stickers.map((s) => (s._id === id ? data : s)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update sticker"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const deleteSticker = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await axios.delete(`/api/stickers/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        stickers: prev.stickers.filter((s) => s._id !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete sticker"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return { ...state, fetchStickers, createSticker, updateSticker, deleteSticker }
}