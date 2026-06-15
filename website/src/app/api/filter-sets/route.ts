import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { FilterSet } from "@/lib/db/models/FilterSet"
import { createFilterSetSchema, updateFilterSetSchema } from "@/lib/validators/filterSet"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const filterSets = await FilterSet.find().sort({ createdAt: -1 })
    return NextResponse.json(filterSets)
  } catch (error) {
    console.error("GET /api/filter-sets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createFilterSetSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const slug = slugify(validation.data.name)
    const existing = await FilterSet.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: "Filter set with this name already exists" }, { status: 400 })
    }

    const filterSet = await FilterSet.create({
      ...validation.data,
      slug,
    })
    return NextResponse.json(filterSet, { status: 201 })
  } catch (error) {
    console.error("POST /api/filter-sets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}