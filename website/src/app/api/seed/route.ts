import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { Collection } from "@/lib/db/models/Collection"
import { Product } from "@/lib/db/models/Product"
import { Sticker } from "@/lib/db/models/Sticker"
import { SizeChart } from "@/lib/db/models/SizeChart"
import { invalidateProductsCache } from "@/lib/cache/invalidation"

// Pre-defined SVG icons as base64 images for stickers to guarantee they load without external image servers
const STICKER_SVGS = {
  new: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiMwZjBmMGYiLz48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsLEhlbHZldGljYSIgZmlsbD0iI2ZmZmZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5FVzwvdGV4dD48L3N2Zz4=",
  sale: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiNkYzI2MjYiLz48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsLEhlbHZldGljYSIgZmlsbD0iI2ZmZmZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNBTEU8L3RleHQ+PC9zdmc+",
  trending: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiNkOTc3MDYiLz48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1zaXplPSIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLEhlbHZldGljYSIgZmlsbD0iI2ZmZmZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhPVDwvdGV4dD48L3N2Zz4=",
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const clearDb = searchParams.get("clear") === "true"

    if (clearDb) {
      console.log("Clearing existing catalog collections for fresh seeding...")
      await Promise.all([
        Product.deleteMany({}),
        Collection.deleteMany({}),
        Sticker.deleteMany({}),
        SizeChart.deleteMany({}),
      ])
    }

    // 1. Seed Stickers
    let stickerNew = await Sticker.findOne({ name: "New In" })
    if (!stickerNew) {
      stickerNew = await Sticker.create({
        name: "New In",
        imageUrl: STICKER_SVGS.new,
        placement: "top-left",
        isActive: true,
      })
    }

    let stickerSale = await Sticker.findOne({ name: "Winter Sale" })
    if (!stickerSale) {
      stickerSale = await Sticker.create({
        name: "Winter Sale",
        imageUrl: STICKER_SVGS.sale,
        placement: "top-right",
        isActive: true,
      })
    }

    let stickerTrending = await Sticker.findOne({ name: "Trending" })
    if (!stickerTrending) {
      stickerTrending = await Sticker.create({
        name: "Trending",
        imageUrl: STICKER_SVGS.trending,
        placement: "bottom-right",
        isActive: true,
      })
    }

    // 2. Seed Size Charts
    let adultSizeChart = await SizeChart.findOne({ name: "Adult Apparel" })
    if (!adultSizeChart) {
      adultSizeChart = await SizeChart.create({
        name: "Adult Apparel",
        columns: ["Size", "Chest (inches)", "Waist (inches)"],
        rows: [
          { size: "XS", measurements: ["32-34", "26-28"] },
          { size: "S", measurements: ["35-37", "29-31"] },
          { size: "M", measurements: ["38-40", "32-34"] },
          { size: "L", measurements: ["41-43", "35-37"] },
          { size: "XL", measurements: ["44-46", "38-40"] },
        ],
        allowCustomSize: false,
        isActive: true,
      })
    }

    let kidsSizeChart = await SizeChart.findOne({ name: "Kids Apparel" })
    if (!kidsSizeChart) {
      kidsSizeChart = await SizeChart.create({
        name: "Kids Apparel",
        columns: ["Size / Age", "Height (inches)", "Weight (lbs)"],
        rows: [
          { size: "2-3Y", measurements: ["35-38", "30-34"] },
          { size: "4-5Y", measurements: ["41-44", "37-42"] },
          { size: "6-7Y", measurements: ["47-50", "48-54"] },
        ],
        allowCustomSize: false,
        isActive: true,
      })
    }

    // 3. Seed Collections
    // Parents
    let collFeatured = await Collection.findOne({ slug: "featured" })
    if (!collFeatured) {
      collFeatured = await Collection.create({
        name: "Featured",
        slug: "featured",
        description: "Curated premium pieces",
        order: 0,
        showInMenu: false,
        status: "active",
      })
    }

    let collWomen = await Collection.findOne({ slug: "women" })
    if (!collWomen) {
      collWomen = await Collection.create({
        name: "Women",
        slug: "women",
        description: "Women's contemporary wear",
        order: 1,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        showInMenu: true,
        status: "active",
      })
    }

    let collMen = await Collection.findOne({ slug: "men" })
    if (!collMen) {
      collMen = await Collection.create({
        name: "Men",
        slug: "men",
        description: "Men's premium collections",
        order: 2,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
        showInMenu: true,
        status: "active",
      })
    }

    let collKids = await Collection.findOne({ slug: "kids" })
    if (!collKids) {
      collKids = await Collection.create({
        name: "Kids",
        slug: "kids",
        description: "Playwear and organic baby clothing",
        order: 3,
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
        showInMenu: true,
        status: "active",
      })
    }

    // Children (Sub-categories)
    let subMenTshirts = await Collection.findOne({ slug: "men-t-shirts" })
    if (!subMenTshirts) {
      subMenTshirts = await Collection.create({
        name: "T-Shirts",
        slug: "men-t-shirts",
        parent: collMen._id,
        order: 1,
        showInMenu: true,
        status: "active",
      })
    }

    let subMenJeans = await Collection.findOne({ slug: "men-jeans" })
    if (!subMenJeans) {
      subMenJeans = await Collection.create({
        name: "Jeans & Denim",
        slug: "men-jeans",
        parent: collMen._id,
        order: 2,
        showInMenu: true,
        status: "active",
      })
    }

    let subWomenDresses = await Collection.findOne({ slug: "women-dresses" })
    if (!subWomenDresses) {
      subWomenDresses = await Collection.create({
        name: "Dresses",
        slug: "women-dresses",
        parent: collWomen._id,
        order: 1,
        showInMenu: true,
        status: "active",
      })
    }

    let subWomenActivewear = await Collection.findOne({ slug: "women-activewear" })
    if (!subWomenActivewear) {
      subWomenActivewear = await Collection.create({
        name: "Activewear",
        slug: "women-activewear",
        parent: collWomen._id,
        order: 2,
        showInMenu: true,
        status: "active",
      })
    }

    let subKidsBoys = await Collection.findOne({ slug: "boys-2-7" })
    if (!subKidsBoys) {
      subKidsBoys = await Collection.create({
        name: "Boys (2-7 Yrs)",
        slug: "boys-2-7",
        parent: collKids._id,
        order: 1,
        showInMenu: true,
        status: "active",
      })
    }

    let subKidsGirls = await Collection.findOne({ slug: "girls-2-7" })
    if (!subKidsGirls) {
      subKidsGirls = await Collection.create({
        name: "Girls (2-7 Yrs)",
        slug: "girls-2-7",
        parent: collKids._id,
        order: 2,
        showInMenu: true,
        status: "active",
      })
    }

    let subKidsBaby = await Collection.findOne({ slug: "baby-0-24" })
    if (!subKidsBaby) {
      subKidsBaby = await Collection.create({
        name: "Baby (0-24 Mos)",
        slug: "baby-0-24",
        parent: collKids._id,
        order: 3,
        showInMenu: true,
        status: "active",
      })
    }

    // 4. Seed Products
    const productsToCreate = [
      {
        name: "Classic Men's Crewneck Tee",
        slug: "classic-mens-crewneck-tee",
        description: "A premium crewneck T-shirt built from 100% long-staple organic cotton. Exceptionally soft, durable, and lightweight, making it the perfect foundation for any daily look.",
        originalPrice: 35.0,
        salePrice: 24.0,
        sku: "M-TEE-01",
        inventory: 120,
        trackInventory: true,
        collections: [collMen._id, subMenTshirts._id, collFeatured._id],
        stickerId: stickerNew._id,
        sizeChartId: adultSizeChart._id,
        status: "active" as const,
        gallery: [
          { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 0 },
          { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 1 },
        ],
        variants: [
          { sku: "M-TEE-01-S", name: "Small - White", price: 24.0, compareAt: 35.0, options: { size: "S", color: "White" }, inventory: 40 },
          { sku: "M-TEE-01-M", name: "Medium - White", price: 24.0, compareAt: 35.0, options: { size: "M", color: "White" }, inventory: 50 },
          { sku: "M-TEE-01-L", name: "Large - White", price: 24.0, compareAt: 35.0, options: { size: "L", color: "White" }, inventory: 30 },
        ],
      },
      {
        name: "Men's Tapered Slim Denim",
        slug: "mens-tapered-slim-denim",
        description: "Crafted from Italian comfort-stretch denim, these tapered slim-fit jeans provide flexibility and a clean silhouette that stays sharp from morning to evening.",
        originalPrice: 95.0,
        salePrice: 75.0,
        sku: "M-DEN-01",
        inventory: 85,
        trackInventory: true,
        collections: [collMen._id, subMenJeans._id, collFeatured._id],
        stickerId: stickerTrending._id,
        sizeChartId: adultSizeChart._id,
        status: "active" as const,
        gallery: [
          { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 0 },
          { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 1 },
        ],
        variants: [
          { sku: "M-DEN-01-30", name: "Size 30", price: 75.0, compareAt: 95.0, options: { size: "30", wash: "Indigo" }, inventory: 25 },
          { sku: "M-DEN-01-32", name: "Size 32", price: 75.0, compareAt: 95.0, options: { size: "32", wash: "Indigo" }, inventory: 40 },
          { sku: "M-DEN-01-34", name: "Size 34", price: 75.0, compareAt: 95.0, options: { size: "34", wash: "Indigo" }, inventory: 20 },
        ],
      },
      {
        name: "Women's Knit Pleated Dress",
        slug: "womens-knit-pleated-dress",
        description: "An elegant pleated maxi dress crafted in a soft, heavy-drape cotton blend. Tailored through the bodice with a fluid A-line pleated skirt that moves beautifully.",
        originalPrice: 120.0,
        salePrice: 89.0,
        sku: "W-DRS-01",
        inventory: 50,
        trackInventory: true,
        collections: [collWomen._id, subWomenDresses._id, collFeatured._id],
        stickerId: stickerSale._id,
        sizeChartId: adultSizeChart._id,
        status: "active" as const,
        gallery: [
          { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 0 },
          { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 1 },
        ],
        variants: [
          { sku: "W-DRS-01-S", name: "Small - Sage", price: 89.0, compareAt: 120.0, options: { size: "S", color: "Sage" }, inventory: 15 },
          { sku: "W-DRS-01-M", name: "Medium - Sage", price: 89.0, compareAt: 120.0, options: { size: "M", color: "Sage" }, inventory: 20 },
          { sku: "W-DRS-01-L", name: "Large - Sage", price: 89.0, compareAt: 120.0, options: { size: "L", color: "Sage" }, inventory: 15 },
        ],
      },
      {
        name: "Kids' Organic Cotton Play Set",
        slug: "kids-organic-cotton-play-set",
        description: "A super comfortable fleece sweatshirt and jogger matching pants set. Made from GOTS-certified 100% organic cotton, brushed inside for extra cozy softness during playtime.",
        originalPrice: 48.0,
        salePrice: 34.0,
        sku: "K-SET-01",
        inventory: 200,
        trackInventory: true,
        collections: [collKids._id, subKidsBoys._id, subKidsGirls._id, collFeatured._id],
        stickerId: stickerNew._id,
        sizeChartId: kidsSizeChart._id,
        status: "active" as const,
        gallery: [
          { url: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 0 },
          { url: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 1 },
        ],
        variants: [
          { sku: "K-SET-01-2Y", name: "2-3 Years - Oatmeal", price: 34.0, compareAt: 48.0, options: { size: "2-3Y", color: "Oatmeal" }, inventory: 70 },
          { sku: "K-SET-01-4Y", name: "4-5 Years - Oatmeal", price: 34.0, compareAt: 48.0, options: { size: "4-5Y", color: "Oatmeal" }, inventory: 80 },
          { sku: "K-SET-01-6Y", name: "6-7 Years - Oatmeal", price: 34.0, compareAt: 48.0, options: { size: "6-7Y", color: "Oatmeal" }, inventory: 50 },
        ],
      },
      {
        name: "Baby Knit Romper (Organic Wool)",
        slug: "baby-knit-romper-organic-wool",
        description: "Delightfully soft knit romper in pure merino organic wool. Designed with wood buttons along the front chest and snap buttons at the bottom hem for easy diaper changes.",
        originalPrice: 45.0,
        salePrice: 35.0,
        sku: "B-RMP-01",
        inventory: 60,
        trackInventory: true,
        collections: [collKids._id, subKidsBaby._id],
        stickerId: stickerTrending._id,
        sizeChartId: kidsSizeChart._id,
        status: "active" as const,
        gallery: [
          { url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80", type: "image" as const, order: 0 },
        ],
        variants: [
          { sku: "B-RMP-01-03M", name: "0-3 Months", price: 35.0, compareAt: 45.0, options: { size: "0-3M", color: "Dusty Rose" }, inventory: 20 },
          { sku: "B-RMP-01-36M", name: "3-6 Months", price: 35.0, compareAt: 45.0, options: { size: "3-6M", color: "Dusty Rose" }, inventory: 20 },
          { sku: "B-RMP-01-612", name: "6-12 Months", price: 35.0, compareAt: 45.0, options: { size: "6-12M", color: "Dusty Rose" }, inventory: 20 },
        ],
      },
    ]

    for (const prodData of productsToCreate) {
      let existingProd = await Product.findOne({ slug: prodData.slug })
      if (!existingProd) {
        await Product.create(prodData)
      } else if (clearDb) {
        await Product.create(prodData)
      }
    }

    await invalidateProductsCache()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Men, Women, Kids categories, sub-categories, size charts, custom stickers and sample products!",
      collections: {
        men: collMen._id,
        women: collWomen._id,
        kids: collKids._id,
        featured: collFeatured._id,
      },
    })
  } catch (error: any) {
    console.error("GET /api/seed error:", error)
    return NextResponse.json({ error: "Seeding failed", details: error?.message || error }, { status: 500 })
  }
}
