"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { ISizeChart, ISizeChartRow } from "@/lib/db/models/SizeChart"

interface CreateSizeChartInput {
  name: string
  images?: string[]
  columns: string[]
  rows: ISizeChartRow[]
  allowCustomSize?: boolean
  customSizeFields?: string[]
  isActive?: boolean
}

interface UpdateSizeChartInput {
  name?: string
  images?: string[]
  columns?: string[]
  rows?: ISizeChartRow[]
  allowCustomSize?: boolean
  customSizeFields?: string[]
  isActive?: boolean
}

interface UseAdminSizeChartsState {
  sizeCharts: ISizeChart[]
  isLoading: boolean
  error: string | null
}

export function useAdminSizeCharts() {
  const [state, setState] = useState<UseAdminSizeChartsState>({
    sizeCharts: [],
    isLoading: false,
    error: null,
  })

  const fetchSizeCharts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<ISizeChart[]>("/api/size-charts")
      setState({ sizeCharts: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch size charts"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createSizeChart = useCallback(async (input: CreateSizeChartInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<ISizeChart>("/api/size-charts", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        sizeCharts: [data, ...prev.sizeCharts],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create size chart"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const updateSizeChart = useCallback(async (id: string, input: UpdateSizeChartInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.put<ISizeChart>(`/api/size-charts/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        sizeCharts: prev.sizeCharts.map((s) => (s._id.toString() === id ? data : s)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update size chart"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const deleteSizeChart = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await axios.delete(`/api/size-charts/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        sizeCharts: prev.sizeCharts.filter((s) => s._id.toString() !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete size chart"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return { ...state, fetchSizeCharts, createSizeChart, updateSizeChart, deleteSizeChart }
}