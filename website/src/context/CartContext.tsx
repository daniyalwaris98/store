"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  variantOptions?: Record<string, string>
  customMeasurements?: Record<string, string>
  name: string
  price: number
  quantity: number
  image?: string
  sku?: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Sync with localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        console.error("Failed to parse cart from localStorage")
      }
    }
  }, [])

  // Save cart to localStorage when items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...item,
          quantity: updated[existingIndex].quantity + item.quantity,
        }
        return updated
      }

      return [
        ...prev,
        {
          ...item,
          id: `${item.productId}-${item.variantId || "default"}-${Date.now()}`,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
