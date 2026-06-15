"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast"

type ToastItem = {
  id: string
  title?: string
  description: string
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toast: (options: { title?: string; description: string; variant?: "default" | "destructive" }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(
    (options: { title?: string; description: string; variant?: "default" | "destructive" }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, ...options }])
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map((t) => (
          <Toast key={t.id} variant={t.variant}>
            {t.title ? (
              <>
                <ToastTitle>{t.title}</ToastTitle>
                <ToastDescription>{t.description}</ToastDescription>
              </>
            ) : (
              <ToastTitle>{t.description}</ToastTitle>
            )}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastContainer")
  return context.toast
}
