import { NextRequest, NextResponse } from "next/server"
import "@/lib/db/mongodb"
import { FilterSet } from "@/lib/db/models/FilterSet"
import { updateFilterSetSchema } from "@/lib/validators/filterSet"
import { getSession } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const filterSet = await FilterSet.findById(id)

    if (!filterSet) {
      return NextResponse.json({ error: "Filter set not found" }, { status: 404 })
    }

    return NextResponse.json(filterSet)
  } catch (error) {
    console.error("GET /api/filter-sets/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateFilterSetSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    const updatePayload: Record<string, unknown> = { ...updateData }
    if (updateData.name) {
      const slug = slugify(updateData.name)
      const slugExisting = await FilterSet.findOne({ slug, _id: { $ne: id } })
      if (slugExisting) {
        return NextResponse.json({ error: "Filter set with this name already exists" }, { status: 400 })
      }
      updatePayload.slug = slug
    }

    const filterSet = await FilterSet.findByIdAndUpdate(id, updatePayload, { new: true })

    if (!filterSet) {
      return NextResponse.json({ error: "Filter set not found" }, { status: 404 })
    }

    return NextResponse.json(filterSet)
  } catch (error) {
    console.error("PUT /api/filter-sets/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const filterSet = await FilterSet.findByIdAndDelete(id)

    if (!filterSet) {
      return NextResponse.json({ error: "Filter set not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/filter-sets/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}