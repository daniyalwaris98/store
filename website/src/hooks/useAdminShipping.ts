"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import { Types } from "mongoose"
import type { CreateShippingZoneInput, UpdateShippingZoneInput } from "@/lib/validators/shipping"
import type { IShippingZone } from "@/lib/db/models/ShippingZone"

interface UseAdminShippingState {
  zones: IShippingZone[]
  isLoading: boolean
  error: string | null
}

export function useAdminShipping() {
  const [state, setState] = useState<UseAdminShippingState>({
    zones: [],
    isLoading: false,
    error: null,
  })

  const fetchZones = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { data } = await axios.get<IShippingZone[]>("/api/shipping/zones")
      setState({ zones: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch zones"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const createZone = useCallback(async (input: CreateShippingZoneInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { data } = await axios.post<IShippingZone>("/api/shipping/zones", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        zones: [data, ...prev.zones],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create zone"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const updateZone = useCallback(async (id: string, input: UpdateShippingZoneInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { data } = await axios.put<IShippingZone>(`/api/shipping/zones/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        zones: prev.zones.map((z) => (z._id.equals(id) ? data : z)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update zone"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const deleteZone = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      await axios.delete(`/api/shipping/zones/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        zones: prev.zones.filter((z) => !z._id.equals(id)),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete zone"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  return { ...state, fetchZones, createZone, updateZone, deleteZone }
}