import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { ShippingZone } from "@/lib/db/models/ShippingZone"
import { createShippingZoneSchema, calculateShippingSchema } from "@/lib/validators/shipping"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    // Calculate shipping for a given country/weight/subtotal
    // This is typically called from the frontend with query params
    return NextResponse.json({ message: "Use POST /api/shipping/calculate" }, { status: 400 })
  } catch (error) {
    console.error("GET /api/shipping error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if this is a calculation request or zone creation
    if (body.country) {
      // Calculate shipping
      const validation = calculateShippingSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation error", details: validation.error.issues },
          { status: 400 }
        )
      }

      const { country, weight = 0, subtotal = 0 } = validation.data

      // Find matching zone
      const zone = await ShippingZone.findOne({
        countries: country,
        status: "active",
      })

      if (!zone) {
        return NextResponse.json({
          available: false,
          message: "No shipping available for this country",
        })
      }

      // Calculate shipping cost
      const handlingFee = zone.handlingFee
      let matchedRate = null

      for (const rate of zone.rates) {
        // Check free shipping conditions
        if (rate.freeShipping && rate.freeAbove && subtotal >= rate.freeAbove) {
          matchedRate = { name: rate.name, price: handlingFee }
          break
        }
        if (rate.freeShipping && rate.weightAbove && weight >= rate.weightAbove) {
          matchedRate = { name: rate.name, price: handlingFee }
          break
        }

        // Calculate weight-based pricing
        const weightCost = rate.perKg > 0 ? weight * rate.perKg : 0
        const totalRatePrice = rate.price + weightCost

        if (!matchedRate || (totalRatePrice + handlingFee) < matchedRate.price) {
          matchedRate = { name: rate.name, price: handlingFee + totalRatePrice }
        }
      }

      return NextResponse.json({
        available: true,
        zone: zone.name,
        rate: matchedRate,
        currency: "USD",
      })
    }

    // Admin: Create shipping zone
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const validation = createShippingZoneSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const zone = await ShippingZone.create(validation.data)
    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    console.error("POST /api/shipping error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}