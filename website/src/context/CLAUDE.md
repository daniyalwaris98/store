# Context Providers

Global state management via React Context. State mutations only happen in Context providers or API routes — never directly in components.

## CartContext

`src/context/CartContext.tsx` — manages shopping cart with localStorage persistence.

- Cart sidebar open/close state (`isOpen`, `openCart`, `closeCart`, `toggleCart`)
- Add, remove, update quantity, clear cart (`addItem`, `removeItem`, `updateQuantity`, `clearCart`)
- `totalItems` and `subtotal` computed from items array
- `CartItem` interface with `id`, `productId`, `variantId`, `variantOptions`, `customMeasurements`, `name`, `price`, `quantity`, `image`, `sku`

Hook: `useCart()` — returns `CartContextType`

## ToastContext

`src/context/ToastContext.tsx` — toast notifications using Radix UI Toast primitives.

- `ToastContainer` provider component wrapping children
- `toast(options)` function with `title`, `description`, `variant` ("default" | "destructive")
- Uses `@/components/ui/toast` components (ToastProvider, Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport)

Hook: `useToast()` — returns the toast function

## CurrencyContext

`src/context/CurrencyContext.tsx` — multi-currency support for the store.

- `CurrencyProvider` with optional `initialSettings` prop for SSR
- `currency` — currently selected display currency
- `setCurrency(code)` — switch display currency (validates against supported currencies)
- `defaultCurrency` — store's default currency
- `supportedCurrencies` — array of all supported currency codes
- `isLoading` — whether settings are still loading
- Persists user's currency preference to localStorage

Hook: `useCurrency()` — returns `CurrencyContextType`

## Other Contexts

Add as needed.
