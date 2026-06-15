import { Collection } from "@/lib/db/models/Collection"
import { buildCollectionTree } from "@/lib/utils/collections"
import { getCachedCollections } from "@/lib/cache"
import { Header } from "@/components/global/header"
import { Footer } from "@/components/global/footer"
import { CartSidebar } from "@/components/global/cart-sidebar"
import { WhatsAppFloatingButton } from "@/components/global/whatsapp-floating-button"
import { SalePopup } from "@/components/global/sale-popup"

async function getCollections() {
  try {
    return await getCachedCollections()
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return []
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const collections = await getCollections()
  const collectionTree = buildCollectionTree(collections)

  return (
    <>
      <Header collectionTree={collectionTree} />
      <main className="flex-1 flex justify-center">{children}</main>
      <Footer collectionTree={collectionTree} />
      <CartSidebar />
      <WhatsAppFloatingButton />
      {/* <SalePopup /> */}
    </>
  )
}
