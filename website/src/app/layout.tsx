import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/CartContext"
import { CurrencyProvider } from "@/context/CurrencyContext"
import { BRAND } from "@/lib/constants/brand"
import "@mdxeditor/editor/style.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
  icons: {
    icon: [{ url: BRAND.favicon }],
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    images: [BRAND.ogImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CurrencyProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  )
}
