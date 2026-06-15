"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
  subtitle?: string
  className?: string
}

export function FAQSection({
  items,
  title = "Frequently Asked Questions",
  subtitle,
  className = "",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  if (items.length === 0) return null

  return (
    <section className={cn("py-5 md:py-6 bg-background", className)}>
      <div className="container mx-auto px-4 max-w-3xl!">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-secondary text-base">{subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl border transition-all duration-200",
                  isOpen
                    ? "border-border-strong shadow-sm bg-background"
                    : "border-border bg-background-subtle hover:border-border-strong hover:shadow-sm"
                )}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span
                    className={cn(
                      "font-medium text-foreground transition-colors"
                    )}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-secondary transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-5 pb-5 pt-0 text-secondary leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}