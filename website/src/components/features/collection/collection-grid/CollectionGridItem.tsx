"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Collection } from "@/types/collection"

interface CollectionGridItemProps {
  collection: Collection
  isFullWidth?: boolean
}

export function CollectionGridItem({ collection, isFullWidth }: CollectionGridItemProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={`group flex flex-col gap-2 ${
        isFullWidth ? "col-span-2 lg:col-span-1 lg:col-start-1" : ""
      }`}
    >
      <div className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            width={900}
            height={900}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {collection.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="text-left">
        <span className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-1">
          {collection.name}
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
    </Link>
  )
}