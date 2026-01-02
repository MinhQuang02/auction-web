import { PrismaClient, product_status_enum, transaction_status_enum, user_role_enum } from '@prisma/client'
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

// ==========================================
// CONFIGURATION
// ==========================================
const TARGET_PRODUCT_COUNT = 1500;
const USER_COUNT = 150;
const EXTRA_IMAGES_PER_PRODUCT_MIN = 2;
const EXTRA_IMAGES_PER_PRODUCT_MAX = 5;

// ==========================================
// INTERFACES
// ==========================================
interface CsvProduct {
  name: string;
  main_category: string;
  sub_category: string;
  image: string;
  link: string;
  ratings: string;
  no_of_ratings: string;
  discount_price: string;
  actual_price: string;
}

interface ProcessedProduct {
  name: string;
  main_category: string;
  sub_category: string;
  main_image: string;
  link: string;
  price: number;
  original_row: CsvProduct;
}

// ==========================================
// HELPERS
// ==========================================
const parsePrice = (priceStr: string | undefined): number => {
  if (!priceStr) return 0;
  // Remove currency symbol, commas, and whitespace
  const numeric = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numeric) || 0;
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomSubset = <T>(arr: T[], size: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Simple data generators to avoid heavy deps
const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Minh', 'Quang', 'Lan', 'Hoa', 'Tuan', 'Hung'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Do', 'Phan', 'Vu', 'Dang'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];

const generateUser = (index: number) => {
  const first = getRandomElement(firstNames);
  const last = getRandomElement(lastNames);
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${index}@${getRandomElement(domains)}`;
  return {
    full_name: `${first} ${last}`,
    email,
    address: `${getRandomInt(1, 999)} Random Street, City ${getRandomInt(1, 20)}`,
  };
};

// ==========================================
// MAIN SCRIPT
// ==========================================
async function main() {
  console.log('🚀 Starting High-Quality Database Seed...');

  // 1. READ & PARSE CSV
  // --------------------------------------------------------
  console.log('📖 Reading CSV file...');
  const csvFilePath = path.join(__dirname, 'electronics_product.csv');

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`CSV file not found at ${csvFilePath}`);
  }

  const allRows: CsvProduct[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => allRows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`✅ Parsed ${allRows.length} rows from CSV.`);

  // 1.1 Pre-process and Filter Bad Data
  // Build a global pool of images for random selection later
  const globalImagePool: string[] = [];

  const validItems: ProcessedProduct[] = [];

  for (const row of allRows) {
    const price = parsePrice(row.discount_price) || parsePrice(row.actual_price);
    if (price > 0 && row.name && row.main_category && row.sub_category) {
      if (row.image) globalImagePool.push(row.image);
      validItems.push({
        name: row.name,
        main_category: row.main_category.trim(),
        sub_category: row.sub_category.trim(),
        main_image: row.image || 'https://placehold.co/600x400?text=No+Image',
        link: row.link,
        price,
        original_row: row
      });
    }
  }

  console.log(`ℹ️  Found ${validItems.length} valid items with prices.`);

  // 1.2 Stratified Sampling logic
  // Group by SubCategory
  const itemsBySubCat: Record<string, ProcessedProduct[]> = {};
  for (const item of validItems) {
    const key = `${item.main_category}|||${item.sub_category}`;
    if (!itemsBySubCat[key]) itemsBySubCat[key] = [];
    itemsBySubCat[key].push(item);
  }

  const subCatKeys = Object.keys(itemsBySubCat);
  console.log(`📊 Found ${subCatKeys.length} unique sub-categories.`);

  // Calculate allocation
  let totalAllocated = 0;
  const allocation: Record<string, number> = {};
  const populationSize = validItems.length;

  for (const key of subCatKeys) {
    const count = itemsBySubCat[key].length;
    let allocated = Math.floor((count / populationSize) * TARGET_PRODUCT_COUNT);
    // Force at least 1
    if (allocated < 1) allocated = 1;
    allocation[key] = allocated;
    totalAllocated += allocated;
  }

  // Adjust to match exactly TARGET_PRODUCT_COUNT
  let diff = TARGET_PRODUCT_COUNT - totalAllocated;
  if (diff !== 0) {
    console.log(`⚠️  Adjustment needed: ${diff} items.`);
    // usage: sort keys by population size descending to add/remove from largest groups
    const sortedKeys = subCatKeys.sort((a, b) => itemsBySubCat[b].length - itemsBySubCat[a].length);

    let i = 0;
    while (diff !== 0) {
      const key = sortedKeys[i % sortedKeys.length];
      if (diff > 0) {
        // Add one if we have enough items
        if (allocation[key] < itemsBySubCat[key].length) {
          allocation[key]++;
          diff--;
        }
      } else {
        // Remove one but keep at least 1
        if (allocation[key] > 1) {
          allocation[key]--;
          diff++;
        }
      }
      i++;
    }
  }

  // 1.3 Select Final Products
  const finalProducts: ProcessedProduct[] = [];
  for (const key of subCatKeys) {
    const needed = allocation[key];
    const available = itemsBySubCat[key];
    const selected = getRandomSubset(available, needed);
    finalProducts.push(...selected);
  }

  console.log(`🎯 Seleced exactly ${finalProducts.length} products for seeding.`);


  // ==============================================================================
  // 2. DATABASE CLEANUP
  // ==============================================================================
  console.log('🧹 Cleaning database...');
  // Delete in order of foreign key dependency
  await prisma.chat_Message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.banned_Bidder.deleteMany();
  await prisma.product_Question.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.bid_History.deleteMany();
  await prisma.product_Description_History.deleteMany();
  await prisma.product_Image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany(); // Users last
  await prisma.system_Config.deleteMany();


  // ==============================================================================
  // 3. SEED USERS
  // ==============================================================================
  console.log('👤 Generating 150 Users...');
  const userPassword = await bcrypt.hash('123456', 10);

  // Create Admin
  await prisma.user.create({
    data: {
      full_name: 'Super Admin',
      email: 'admin@gmail.com',
      password: userPassword,
      role: 'admin',
      is_email_verified: true,
      address: 'Admin HQ'
    }
  });

  const usersData = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const info = generateUser(i);
    // First 10 are sellers, rest are bidders
    // Actually let's mix roles: 20 sellers, rest bidders
    const role: user_role_enum = i <= 20 ? 'seller' : 'bidder';
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - getRandomInt(1, 365));

    usersData.push({
      full_name: info.full_name,
      email: info.email,
      password: userPassword,
      role: role,
      is_email_verified: true,
      address: info.address,
      avg_rating: getRandomInt(30, 50) / 10, // 3.0 to 5.0
      total_ratings: getRandomInt(0, 50),
      created_at: createdAt
    });
  }

  // Bulk insert users
  // Note: createMany is supported in recent Prisma versions for Postgres
  await prisma.user.createMany({ data: usersData });
  const allUsers = await prisma.user.findMany();
  const sellers = allUsers.filter(u => u.role === 'seller');
  const bidders = allUsers.filter(u => u.role === 'bidder');
  console.log(`✅ Created ${allUsers.length} users (${sellers.length} sellers, ${bidders.length} bidders).`);


  // ==============================================================================
  // 4. SEED CATEGORIES
  // ==============================================================================
  console.log('📂 Creating Category Hierarchy...');

  // Identify unique categories from the selected products to ensure we only create what's needed
  const categoriesMap = new Map<string, number>(); // Name -> ID
  const subCategoriesMap = new Map<string, number>(); // "Main|Sub" -> ID

  const uniqueMainCats = [...new Set(finalProducts.map(p => p.main_category))];

  for (const mainCatName of uniqueMainCats) {
    const c = await prisma.category.create({ data: { name: mainCatName } });
    categoriesMap.set(mainCatName, c.category_id);
  }

  // Create subcategories
  for (const p of finalProducts) {
    const key = `${p.main_category}|||${p.sub_category}`;
    if (!subCategoriesMap.has(key)) {
      const parentId = categoriesMap.get(p.main_category);
      if (parentId) {
        const sub = await prisma.category.create({
          data: { name: p.sub_category, parent_id: parentId }
        });
        subCategoriesMap.set(key, sub.category_id);
      }
    }
  }
  console.log(`✅ Categories linked.`);


  // ==============================================================================
  // 5. SEED PRODUCTS & IMAGES
  // ==============================================================================
  console.log('📦 Seeding 1500 Products (this may take a moment)...');

  // We'll prepare massive arrays for createMany? 
  // Product creation requires relational constraints or return IDs. 
  // We need IDs to link images, bids, etc. So we cannot easily use createMany for Products if we want to immediately link tables.
  // We will loop. Using a transaction per batch of 50 for speed.

  const productsResultIds: number[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < finalProducts.length; i += BATCH_SIZE) {
    const batch = finalProducts.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(async (tx) => {
      for (const item of batch) {
        const subKey = `${item.main_category}|||${item.sub_category}`;
        const catId = subCategoriesMap.get(subKey);
        const seller = getRandomElement(sellers);

        // Randomize status/time
        // 80% active, 15% sold, 5% ended/other
        const randStatus = Math.random();
        let status: product_status_enum = 'active';
        let winnerId: number | null = null;
        let endTime = new Date();

        if (randStatus > 0.85) {
          status = 'sold';
          endTime = new Date(); // ended now
          endTime.setDate(endTime.getDate() - getRandomInt(1, 30)); // ended in past
        } else if (randStatus > 0.80) {
          status = 'ended_no_winner';
          endTime = new Date();
          endTime.setDate(endTime.getDate() - getRandomInt(1, 30));
        } else {
          status = 'active';
          endTime = new Date();
          endTime.setDate(endTime.getDate() + getRandomInt(1, 14)); // ends in future
        }

        const product = await tx.product.create({
          data: {
            name: item.name.substring(0, 255), // truncate if too long
            description: `Official authentic product.\nCategory: ${item.sub_category}.\nMore details: ${item.link}`,
            start_price: item.price,
            current_price: item.price,
            step_price: Math.max(1000, Math.ceil(item.price * 0.05)),
            buy_now_price: Math.ceil(item.price * 1.5),
            main_image_url: item.main_image,
            start_time: new Date(new Date().setDate(new Date().getDate() - 7)), // started 7 days ago
            end_time: endTime,
            status: status,
            seller_id: seller.user_id,
            category_id: catId!,
            bid_count: 0
          }
        });

        productsResultIds.push(product.product_id);

        // EXTRA IMAGES
        // Pick random images from pool, excluding main
        const extraCount = getRandomInt(EXTRA_IMAGES_PER_PRODUCT_MIN, EXTRA_IMAGES_PER_PRODUCT_MAX);
        const randomImages = getRandomSubset(globalImagePool, extraCount + 5)
          .filter(img => img !== item.main_image)
          .slice(0, extraCount);

        if (randomImages.length > 0) {
          await tx.product_Image.createMany({
            data: randomImages.map(url => ({
              product_id: product.product_id,
              image_url: url
            }))
          });
        }
      }
    }, {
      maxWait: 5000, // default: 2000
      timeout: 20000, // default: 5000
    });

    if (i % 100 === 0) console.log(`   Processed ${i} / ${finalProducts.length} items...`);
  }
  console.log(`✅ All products seeded.`);


  // ==============================================================================
  // 6. GENERATE RELATIONAL DATA (Lived-in feel)
  // ==============================================================================
  console.log('🔗 Generating Lived-In Data (Bids, Reviews, Transactions)...');

  const allProductsDb = await prisma.product.findMany({ select: { product_id: true, status: true, current_price: true, seller_id: true, start_time: true } });

  // We'll prepare bulk inserts where possible specifically for performance
  const bidHistoryData: any[] = [];
  const watchlistData: any[] = [];
  const ratingsData: any[] = [];
  const transactionsData: any[] = [];
  const messagesData: any[] = [];

  for (const p of allProductsDb) {
    // 6.1 Watchlists (Random users watch random products)
    if (Math.random() > 0.7) { // 30% of products are watched
      const watchersCount = getRandomInt(1, 5);
      const watchers = getRandomSubset(bidders, watchersCount);
      for (const w of watchers) {
        watchlistData.push({ user_id: w.user_id, product_id: p.product_id });
      }
    }

    // 6.2 Bids
    // If SOLD or ACTIVE, it likely has bids.
    // If ENDED_NO_WINNER, maybe it had 0 bids or Reserve not met.
    let currentPrice = Number(p.current_price);
    let winningBidderId: number | null = null;
    let bidCount = 0;

    if (p.status === 'sold' || (p.status === 'active' && Math.random() > 0.3)) {
      // Simulate 1 to 15 bids
      bidCount = getRandomInt(1, 15);
      let runningPrice = Number(p.current_price); // Start from base

      // We need strictly increasing bids with timestamps
      let lastTime = new Date(p.start_time || Date.now());

      // Get random unique bidders for this product
      // A bidder can bid multiple times, but let's keep it simple: sequence of different people or same person fighting
      const participatingBidders = getRandomSubset(bidders, Math.min(5, bidCount));

      for (let b = 0; b < bidCount; b++) {
        const bidder = participatingBidders[b % participatingBidders.length];
        // Increment price
        const increment = getRandomInt(1000, 50000);
        runningPrice += increment;

        // Advance time
        lastTime = new Date(lastTime.getTime() + getRandomInt(100000, 3600000)); // + minutes/hours

        bidHistoryData.push({
          product_id: p.product_id,
          bidder_id: bidder.user_id,
          max_bid_amount: runningPrice,
          bid_time: lastTime
        });

        winningBidderId = bidder.user_id;
      }
      currentPrice = runningPrice;
    }

    // UPDATE PRODUCT with calculated bid data
    if (bidCount > 0) {
      await prisma.product.update({
        where: { product_id: p.product_id },
        data: {
          current_price: currentPrice,
          bid_count: bidCount,
          current_bidder_id: winningBidderId,
          winner_id: p.status === 'sold' ? winningBidderId : null
        }
      });
    }

    // 6.3 Transactions for SOLD items
    if (p.status === 'sold' && winningBidderId) {
      const buyerId = winningBidderId;
      transactionsData.push({
        product_id: p.product_id,
        buyer_id: buyerId,
        seller_id: p.seller_id,
        status: 'completed',
        payment_proof: 'https://placehold.co/invoice.png',
        shipping_address: 'Sample Address, VN',
        created_at: new Date()
      });

      // 6.4 Ratings (Only for completed transactions)
      if (Math.random() > 0.2) { // 80% chance of rating provided
        ratingsData.push({
          product_id: p.product_id,
          rater_id: buyerId,
          rated_user_id: p.seller_id,
          rating_value: Math.random() > 0.1 ? 1 : -1, // Mostly positive
          comment: Math.random() > 0.1 ? "Great product, fast shipping!" : "Item slightly different from description.",
          created_at: new Date()
        });
      }
    }
  }

  // BATCH INSERT RELATIONAL DATA
  console.log(`   inserting ${watchlistData.length} watchlist items...`);
  await prisma.watchlist.createMany({ data: watchlistData, skipDuplicates: true });

  console.log(`   inserting ${bidHistoryData.length} bid history records...`);
  // Bid history might be large, chunk it
  for (let i = 0; i < bidHistoryData.length; i += 1000) {
    await prisma.bid_History.createMany({ data: bidHistoryData.slice(i, i + 1000) });
  }

  console.log(`   inserting ${transactionsData.length} transactions...`);
  await prisma.transaction.createMany({ data: transactionsData });

  console.log(`   inserting ${ratingsData.length} ratings...`);
  await prisma.rating.createMany({ data: ratingsData });

  // 7. CHAT MESSAGES
  console.log('💬 Generating Chat Messages...');
  const allTransactions = await prisma.transaction.findMany();
  const chatMessagesData: any[] = [];

  for (const t of allTransactions) {
    // 2-5 messages per transaction
    const numMessages = getRandomInt(2, 5);
    let lastTime = new Date(t.created_at || Date.now());

    for (let m = 0; m < numMessages; m++) {
      const isBuyerSender = m % 2 === 0;
      chatMessagesData.push({
        transaction_id: t.transaction_id,
        sender_id: isBuyerSender ? t.buyer_id : t.seller_id,
        receiver_id: isBuyerSender ? t.seller_id : t.buyer_id,
        message_text: isBuyerSender ?
          getRandomElement(["Hello, when will you ship?", "Payment sent!", "Is this still available?", "Please pack carefully"]) :
          getRandomElement(["I will ship tomorrow.", "Received, thanks.", "Yes available.", "Sure thing."]),
        sent_at: new Date(lastTime.getTime() + m * 3600000)
      });
    }
  }

  await prisma.chat_Message.createMany({ data: chatMessagesData });

  // 8. System Config
  await prisma.system_Config.createMany({
    data: [
      { setting_key: 'site_name', setting_value: 'Ultimate Auction' },
      { setting_key: 'currency', setting_value: 'VND' },
      { setting_key: 'platform_fee_percent', setting_value: '5' }
    ]
  });

  console.log('✅✅✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });