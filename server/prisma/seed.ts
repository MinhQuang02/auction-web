import { PrismaClient, product_status_enum, transaction_status_enum } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import fs from 'fs'
import csv from 'csv-parser'
import path from 'path'
import { fileURLToPath } from 'url'



dotenv.config()
const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to clean price strings
function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0
  const numeric = priceStr.replace(/[^0-9.]/g, '')
  return parseFloat(numeric) || 0
}

async function main() {
  console.log('🚀 Starting ULTIMATE database seed...')

  // ==============================================================================
  // 1. CLEANUP (Delete everything to start fresh)
  // ==============================================================================
  console.log('🧹 Cleaning old data...')
  await prisma.chat_Message.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.banned_Bidder.deleteMany()
  await prisma.product_Question.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.bid_History.deleteMany()
  await prisma.product_Description_History.deleteMany()
  await prisma.product_Image.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.system_Config.deleteMany()

  // ==============================================================================
  // 2. CREATE USERS
  // ==============================================================================
  console.log('👤 Creating Users...')
  const password = await bcrypt.hash('123456', 10)
  
  // Admin
  await prisma.user.create({
    data: { full_name: 'Super Admin', email: 'admin@gmail.com', password, role: 'admin', is_email_verified: true }
  })

  // 5 Sellers
  const sellers = []
  for (let i = 1; i <= 5; i++) {
    const s = await prisma.user.create({
      data: {
        full_name: `Seller ${i}`,
        email: `seller${i}@gmail.com`,
        password,
        role: 'seller',
        address: 'Warehouse District',
        is_email_verified: true,
        avg_rating: 4.5,
        total_ratings: 10
      }
    })
    sellers.push(s)
  }

  // 10 Bidders
  const bidders = []
  for (let i = 1; i <= 10; i++) {
    const b = await prisma.user.create({
      data: {
        full_name: `Bidder ${i}`,
        email: `bidder${i}@gmail.com`,
        password,
        role: 'bidder',
        is_email_verified: true,
        avg_rating: i > 8 ? 2.0 : 5.0, // Make last 2 bidders have bad ratings
      }
    })
    bidders.push(b)
  }

  // ==============================================================================
  // 3. CREATE CATEGORIES
  // ==============================================================================
  console.log('📂 Creating Categories...')
  const catElec = await prisma.category.create({ data: { name: 'Electronics' } })
  const catPhones = await prisma.category.create({ data: { name: 'Mobile Phones', parent_id: catElec.category_id } })
  const catLaptops = await prisma.category.create({ data: { name: 'Laptops', parent_id: catElec.category_id } })
  const catAccessories = await prisma.category.create({ data: { name: 'Accessories', parent_id: catElec.category_id } })

  // ==============================================================================
  // 4. IMPORT PRODUCTS FROM CSV
  // ==============================================================================
  console.log('📦 Importing products from CSV...')
  
  const csvFilePath = path.join(__dirname, 'electronics_product.csv')
  const productsFromCsv: any[] = []

  if (fs.existsSync(csvFilePath)) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => productsFromCsv.push(row))
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
    })
  }

  // Use first 100 products
  const selectedProducts = productsFromCsv.slice(0, 100)

  for (const row of selectedProducts) {
    // 1. Clean up price and category logic
    let price = parsePrice(row.discount_price) || parsePrice(row.actual_price) || 5000
    let categoryId = catAccessories.category_id
    const nameLower = row.name.toLowerCase()
    
    if (nameLower.includes('laptop')) categoryId = catLaptops.category_id
    else if (nameLower.includes('phone')) categoryId = catPhones.category_id

    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)]
    const mainImage = row.image || 'https://placehold.co/600x400'

    // 2. Create the Product
    const newProduct = await prisma.product.create({
      data: {
        name: row.name.substring(0, 255),
        description: `Imported Item.\nSee more at: ${row.link}`,
        category_id: categoryId,
        seller_id: randomSeller.user_id,
        start_price: price,
        current_price: price,
        step_price: Math.ceil(price * 0.05),
        main_image_url: mainImage, // Real image from CSV
        start_time: new Date(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60000),
        status: 'active'
      }
    })

    // 3. GENERATE GALLERY IMAGES (The fix)
    // We add 3 extra images to the Product_Image table for this product
    await prisma.product_Image.createMany({
      data: [
        // Image 1: Re-use the main one (so the gallery isn't empty)
        { product_id: newProduct.product_id, image_url: mainImage },
        // Image 2: A placeholder "Side View"
        { product_id: newProduct.product_id, image_url: 'https://placehold.co/600x400?text=Side+View' },
        // Image 3: A placeholder "Back View"
        { product_id: newProduct.product_id, image_url: 'https://placehold.co/600x400?text=Back+View' }
      ]
    })
  }

  // ==============================================================================
  // 5. FILL RELATIONSHIP TABLES (Ensuring no table is empty)
  // ==============================================================================
  console.log('🔗 Linking tables and creating history...')
  
  // Fetch what we just created
  const allProducts = await prisma.product.findMany()
  const allUsers = [...sellers, ...bidders]

  // --- A. Product_Image (Extra images for the first 10 products) ---
  for (let i = 0; i < 10; i++) {
    await prisma.product_Image.create({
      data: {
        product_id: allProducts[i].product_id,
        image_url: `https://placehold.co/600x400?text=Extra+Image+${i}`
      }
    })
  }

  // --- B. Product_Description_History (Simulate edits for first 5 products) ---
  for (let i = 0; i < 5; i++) {
    await prisma.product_Description_History.create({
      data: {
        product_id: allProducts[i].product_id,
        added_description: `[UPDATE ${new Date().toLocaleDateString()}]: Added new specs information.`,
        added_at: new Date()
      }
    })
  }

  // --- C. Bid_History & Watchlist (Simulate activity) ---
  for (let i = 0; i < 10; i++) {
    const product = allProducts[i]
    const bidder = bidders[i % bidders.length]
    
    // Create a Watchlist entry
    await prisma.watchlist.create({
      data: { user_id: bidder.user_id, product_id: product.product_id }
    })

    // Create a Bid
    await prisma.bid_History.create({
      data: {
        product_id: product.product_id,
        bidder_id: bidder.user_id,
        max_bid_amount: Number(product.current_price) + 50000,
        bid_time: new Date()
      }
    })
    
    // Update product bid count
    await prisma.product.update({
      where: { product_id: product.product_id },
      data: { bid_count: { increment: 1 }, current_bidder_id: bidder.user_id }
    })
  }

  // --- D. Product_Question (Q&A) ---
  for (let i = 0; i < 6; i++) {
    await prisma.product_Question.create({
      data: {
        product_id: allProducts[i].product_id,
        asker_id: bidders[i % bidders.length].user_id,
        question_text: "Is this item still available for immediate shipping?",
        question_time: new Date(),
        answer_text: i % 2 === 0 ? "Yes, we ship within 24 hours." : null, // Half answered, half not
        answer_time: i % 2 === 0 ? new Date() : null
      }
    })
  }

  // --- E. Ratings (Feedback) ---
  for (let i = 0; i < 5; i++) {
    await prisma.rating.create({
      data: {
        product_id: allProducts[i].product_id,
        rater_id: bidders[i].user_id,
        rated_user_id: sellers[0].user_id, // Rating the first seller
        rating_value: 1, // +1 Like
        comment: "Great transaction, very happy!",
      }
    })
  }

  // --- F. Banned_Bidder (Blacklist) ---
  // Ban the last bidder from the first 5 products
  const badBidder = bidders[bidders.length - 1]
  for (let i = 0; i < 5; i++) {
    await prisma.banned_Bidder.create({
      data: {
        product_id: allProducts[i].product_id,
        bidder_id: badBidder.user_id
      }
    })
  }

  // --- G. System_Config (Site Settings) ---
  const configs = [
    { key: 'site_name', val: 'My Auction Site' },
    { key: 'maintenance_mode', val: 'false' },
    { key: 'max_upload_size', val: '5MB' },
    { key: 'support_email', val: 'support@auction.com' },
    { key: 'currency', val: 'VND' }
  ]
  for (const c of configs) {
    await prisma.system_Config.create({
      data: { setting_key: c.key, setting_value: c.val }
    })
  }

  // ==============================================================================
  // 6. TRANSACTIONS & CHAT (Simulate Sold Items)
  // ==============================================================================
  console.log('💰 Creating Completed Transactions...')

  // Take the last 5 products and mark them as "SOLD"
  const productsToSell = allProducts.slice(-5)
  
  for (let i = 0; i < productsToSell.length; i++) {
    const p = productsToSell[i]
    const buyer = bidders[i]
    const seller = sellers[0]

    // 1. Mark Product as Sold
    await prisma.product.update({
      where: { product_id: p.product_id },
      data: { 
        status: 'sold', 
        winner_id: buyer.user_id,
        current_bidder_id: buyer.user_id
      }
    })

    // 2. Create Transaction
    const trans = await prisma.transaction.create({
      data: {
        product_id: p.product_id,
        buyer_id: buyer.user_id,
        seller_id: seller.user_id,
        status: 'completed',
        payment_proof: 'https://placehold.co/600x800?text=Receipt',
        shipping_address: '123 Fake Street, District 1',
      }
    })

    // 3. Create Chat Messages for this transaction
    await prisma.chat_Message.create({
      data: {
        transaction_id: trans.transaction_id,
        sender_id: buyer.user_id,
        receiver_id: seller.user_id,
        message_text: "I have transferred the money, please check."
      }
    })
    await prisma.chat_Message.create({
      data: {
        transaction_id: trans.transaction_id,
        sender_id: seller.user_id,
        receiver_id: buyer.user_id,
        message_text: "Received! Will ship tomorrow."
      }
    })
  }

  console.log('✅✅✅ ULTIMATE SEED COMPLETE. All tables populated.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })