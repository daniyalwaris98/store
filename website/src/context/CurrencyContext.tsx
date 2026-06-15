"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { DEFAULT_CURRENCY } from "@/lib/currency"

interface StoreSettingsData {
  defaultCurrency: string
  supportedCurrencies: string[]
}

interface CurrencyContextType {
  /** The currently selected currency for display */
  currency: string
  /** Switch the display currency */
  setCurrency: (code: string) => void
  /** The store's default currency */
  defaultCurrency: string
  /** All currencies the store supports */
  supportedCurrencies: string[]
  /** Whether settings are still loading */
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const STORAGE_KEY = "selected-currency"

interface CurrencyProviderProps {
  children: React.ReactNode
  /** Optional server-side pre-fetched settings to avoid a flash */
  initialSettings?: StoreSettingsData
}

export function CurrencyProvider({ children, initialSettings }: CurrencyProviderProps) {
  const [isLoading, setIsLoading] = useState(!initialSettings)
  const [defaultCurrency, setDefaultCurrency] = useState(
    initialSettings?.defaultCurrency || DEFAULT_CURRENCY
  )
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>(
    initialSettings?.supportedCurrencies || [DEFAULT_CURRENCY]
  )
  const [currency, setCurrencyState] = useState(
    initialSettings?.defaultCurrency || DEFAULT_CURRENCY
  )

  // On mount: fetch store settings (if not provided) and restore saved preference
  useEffect(() => {
    const init = async () => {
      let settings = initialSettings
      if (!settings) {
        try {
          const res = await fetch("/api/store-settings")
          if (res.ok) {
            settings = await res.json()
          }
        } catch (err) {
          console.error("Failed to fetch store settings for currency:", err)
        }
      }

      if (settings) {
        setDefaultCurrency(settings.defaultCurrency)
        setSupportedCurrencies(settings.supportedCurrencies)

        // Restore user's saved preference if it's still supported
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && settings.supportedCurrencies.includes(saved)) {
          setCurrencyState(saved)
        } else {
          setCurrencyState(settings.defaultCurrency)
        }
      }

      setIsLoading(false)
    }

    init()
  }, [initialSettings])

  const setCurrency = useCallback(
    (code: string) => {
      if (supportedCurrencies.includes(code)) {
        setCurrencyState(code)
        localStorage.setItem(STORAGE_KEY, code)
      }
    },
    [supportedCurrencies]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        defaultCurrency,
        supportedCurrencies,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
