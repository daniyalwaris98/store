import { useState, useCallback } from "react"
import axios from "axios"

interface StoreSettingsData {
  defaultCurrency: string
  supportedCurrencies: string[]
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get<StoreSettingsData>("/api/store-settings")
      setSettings(data)
      return data
    } catch (error) {
      console.error("Failed to fetch store settings:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (updates: Partial<StoreSettingsData>) => {
    try {
      const { data } = await axios.put<StoreSettingsData>("/api/store-settings", updates)
      setSettings(data)
      return data
    } catch (error) {
      console.error("Failed to update store settings:", error)
      throw error
    }
  }, [])

  return { settings, isLoading, fetchSettings, updateSettings }
}
