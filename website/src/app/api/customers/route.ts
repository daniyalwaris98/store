import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { Customer } from "@/lib/db/models/Customer"
import { Order } from "@/lib/db/models/Order"
import { createCustomerSchema } from "@/lib/validators/customer"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const [customers, total] = await Promise.all([
      Customer.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customer",
            as: "orderDocs",
          },
        },
        {
          $addFields: {
            orderCount: { $size: "$orderDocs" },
          },
        },
        {
          $project: {
            orderDocs: 0,
          },
        },
      ]),
      Customer.countDocuments(filter),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/customers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validation = createCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existing = await Customer.findOne({ email: validation.data.email })
    if (existing) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 400 })
    }

    const customer = await Customer.create(validation.data)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("POST /api/customers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}