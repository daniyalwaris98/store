"use client"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/context/CurrencyContext"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
}

export function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
  const { defaultCurrency } = useCurrency()
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">
            {typeof value === "number" && value > 1000
              ? formatCurrency(value, defaultCurrency)
              : value}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              isPositive && "text-green-600",
              isNegative && "text-red-600"
            )}>
              {isPositive && <TrendingUp className="h-4 w-4" />}
              {isNegative && <TrendingDown className="h-4 w-4" />}
              <span>
                {isPositive ? "+" : ""}{change}%
                {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsCardsProps {
  stats: {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: React.ReactNode
  }[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}