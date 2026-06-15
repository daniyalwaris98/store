"use client"

import { useParams } from "next/navigation"
import CollectionForm from "@/components/features/admin/collection/CollectionForm"

export default function AdminCollectionEditPage() {
  const params = useParams()
  const collectionId = params.id as string

  return <CollectionForm mode="edit" collectionId={collectionId} />
}