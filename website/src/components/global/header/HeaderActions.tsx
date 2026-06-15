"use client"

import Link from "next/link"
import { ShoppingBag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from "@/lib/currency"

export function HeaderActions() {
  const { totalItems, openCart } = useCart()
  const { currency, setCurrency, supportedCurrencies } = useCurrency()
  const showCurrencySwitch = supportedCurrencies.length > 1

  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      {/* Currency Switcher */}
      {showCurrencySwitch && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-xs font-medium gap-1.5">
              <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {getCurrencySymbol(currency)}
              </span>
              {currency}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuLabel className="text-xs">Currency</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {supportedCurrencies.map((code) => {
              const conf = SUPPORTED_CURRENCIES[code]
              return (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={`flex items-center gap-2 ${currency === code ? "bg-accent/10 font-semibold" : ""}`}
                >
                  <span className="font-mono text-xs w-6 text-center">{conf?.symbol || code}</span>
                  <span className="text-sm">{conf?.name || code}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button variant="ghost" size="icon" asChild>
        <Link href="/search">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs leading-1 text-white">
            {totalItems}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </Button>
    </div>
  )
}

