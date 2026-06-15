import { CheckoutHeader } from "./CheckoutHeader"
import { CartSidebar } from "@/components/global/cart-sidebar"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CheckoutHeader />
      <main className="flex-1">{children}</main>
      <CartSidebar />
    </>
  )
}