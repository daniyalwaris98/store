import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { RecentPurchase } from "@/lib/db/models/RecentPurchase"

interface RecentPurchase {
  orderNumber: string
  customerName: string
  productName: string
  productImage?: string
  timestamp: string
}

const MAX_RECENT_PURCHASES = 10

export async function GET() {
  try {
    await connectDB()

    const purchases = await RecentPurchase.find()
      .sort({ createdAt: -1 })
      .limit(MAX_RECENT_PURCHASES)
      .lean()

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({
        purchases: [
          {
            orderNumber: "ORD-00001",
            customerName: "Sarah M.",
            productName: "Classic T-Shirt",
            timestamp: new Date().toISOString(),
          },
        ],
      })
    }

    const result: RecentPurchase[] = purchases.map((p) => ({
      orderNumber: p.orderNumber,
      customerName: p.customerName,
      productName: p.productName,
      productImage: p.productImage,
      timestamp: p.createdAt.toISOString(),
    }))

    return NextResponse.json({ purchases: result })
  } catch (error) {
    console.error("GET /api/recent-purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, customerName, productName, productImage } = body

    if (!orderNumber || !customerName || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()
    await RecentPurchase.create({
      orderNumber,
      customerName,
      productName,
      productImage,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/recent-purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}