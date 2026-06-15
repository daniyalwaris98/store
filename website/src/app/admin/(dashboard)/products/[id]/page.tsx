"use client"

import { useParams } from "next/navigation"
import ProductForm from "@/components/features/admin/product/ProductForm"

export default function AdminProductEditPage() {
  const params = useParams()
  const productId = params.id as string

  return <ProductForm mode="edit" productId={productId} />
}