import { connectDB } from "@/lib/db/mongodb"
import { ShippingZone } from "@/lib/db/models/ShippingZone"
import CheckoutPageClient from "./CheckoutPageClient"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
}

async function getShippingMethods(): Promise<ShippingMethod[]> {
  try {
    await connectDB()
    const zone = await ShippingZone.findOne({
      countries: "PK",
      status: "active",
    })

    if (!zone) {
      return [{ id: "free", name: "Standard Shipping", description: "5-7 business days", price: 0 }]
    }

    const handlingFee = zone.handlingFee
    const methods: ShippingMethod[] = []

    for (const rate of zone.rates) {
      const price = rate.freeShipping ? 0 : rate.price + handlingFee
      methods.push({
        id: rate.name,
        name: rate.name,
        description: `Delivery available`,
        price,
      })
    }

    if (methods.length === 0) {
      return [{ id: "free", name: "Standard Shipping", description: "5-7 business days", price: 0 }]
    }

    return methods
  } catch (error) {
    console.error("Error fetching shipping methods:", error)
    return [{ id: "free", name: "Standard Shipping", description: "5-7 business days", price: 0 }]
  }
}

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods()

  return <CheckoutPageClient shippingMethods={shippingMethods} />
}