
import { PrismaClient, product_status_enum, transaction_status_enum } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// ==========================================
// HELPERS
// ==========================================
const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = <T>(arr: T[]): T | undefined => {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomSubset = <T>(arr: T[], size: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
};

// Generic content for generation
const QUESTIONS = [
    "Does this come with original packaging?",
    "Is the warranty still valid?",
    "Can you ship express?",
    "Are there any scratches on the back?",
    "Do you have the receipt?",
    "Is the price negotiable?",
    "How long have you owned this?",
    "Does it work with 220V?",
    "Will you strip parts?",
    "Can I verify locally?",
    "Is this the 2024 model?",
    "Any dead pixels?",
    "Battery health percentage?",
    "Is the leather genuine?",
    "Last serviced date?"
];

const ANSWERS = [
    "Yes, it does.",
    "No warranty left, sorry.",
    "I can ship express for extra cost.",
    "No scratches, mint condition.",
    "Yes, receipt included.",
    "Price is fixed.",
    "About 6 months.",
    "Yes 110-240V.",
    "No parting out.",
    "Yes, local pickup available.",
    "It is the previous model.",
    "Screen is perfect.",
    "Battery is at 92%.",
    "Yes, real leather.",
    "Serviced last month."
];

const DESC_UPDATES = [
    "Added new photos of the back/sides.",
    "Clarification: This is the 128GB model, not 64GB.",
    "Price reduced for quick sale.",
    "Found the original box, will include it.",
    "Updated shipping costs.",
    "Note: Small dent on corner (see photo 4)."
];

async function main() {
    console.log('🚀 Starting Non-Destructive Seed Update...');

    // 1. FETCH BASE DATA
    const allUsers = await prisma.user.findMany();
    const bidders = allUsers.filter(u => u.role === 'bidder');
    // Exclude admin and our target user from general random bans later
    const potentialBannedTargets = bidders.filter(u => u.user_id !== 1268);

    const allProducts = await prisma.product.findMany();
    const activeProducts = allProducts.filter(p => p.status === 'active');
    const soldProducts = allProducts.filter(p => p.status === 'sold');

    console.log(`📊 Found ${allUsers.length} users and ${allProducts.length} products.`);

    // ==============================================================================
    // PART 1: POPULATE SPECIFIC TABLES (Randomized)
    // ==============================================================================

    // A. ProductQuestion
    console.log('💬 Populating Product Questions (Ensuring ~5 per product)...');

    const questionData: any[] = [];

    for (const p of allProducts) {
        // Generate between 3 and 7 questions per product.
        // User requested "khoảng 5 cái" (around 5).
        const count = getRandomInt(3, 7);

        for (let k = 0; k < count; k++) {
            const u = getRandomElement(bidders);
            if (!u) continue;

            const qText = getRandomElement(QUESTIONS)!;
            const hasAnswer = Math.random() > 0.4; // 60% chance of answer

            questionData.push({
                product_id: p.product_id,
                asker_id: u.user_id,
                question_text: qText,
                question_time: new Date(),
                answer_text: hasAnswer ? getRandomElement(ANSWERS) : null,
                answer_time: hasAnswer ? new Date() : null
            });
        }
    }

    // Bulk Insert in chunks to avoid memory/packet limits
    const BATCH_SIZE = 1000;
    for (let i = 0; i < questionData.length; i += BATCH_SIZE) {
        await prisma.product_Question.createMany({
            data: questionData.slice(i, i + BATCH_SIZE)
        });
    }

    console.log(`   Added ${questionData.length} questions across ${allProducts.length} products.`);

    // B. ProductDescriptionHistory
    console.log('📝 Populating Product Description History...');
    let historyAdded = 0;
    for (let i = 0; i < 20; i++) {
        const p = getRandomElement(activeProducts); // Only update active ones usually
        if (!p) continue;

        await prisma.product_Description_History.create({
            data: {
                product_id: p.product_id,
                added_description: getRandomElement(DESC_UPDATES)!,
                added_at: new Date()
            }
        });
        historyAdded++;
    }
    console.log(`   Added ${historyAdded} description history entries.`);

    // C. BannedBidder
    console.log('🚫 Populating Banned Bidders...');
    let bansAdded = 0;
    const productsForBan = getRandomSubset(activeProducts, 5); // Ban usually on active products
    for (const p of productsForBan) {
        const u = getRandomElement(potentialBannedTargets); // Ensure we don't ban 1268
        if (!u) continue;

        // Check existing to obey idempotency (sort of, create throws if duplicate)
        // We use upsert or findUnique check. Or just try/catch unique constraint error.
        // Ideally check first.
        const existing = await prisma.banned_Bidder.findUnique({
            where: { product_id_bidder_id: { product_id: p.product_id, bidder_id: u.user_id } }
        });

        if (!existing) {
            await prisma.banned_Bidder.create({
                data: {
                    product_id: p.product_id,
                    bidder_id: u.user_id
                }
            });
            bansAdded++;
        }
    }
    console.log(`   Added ${bansAdded} banned bidder entries.`);


    // ==============================================================================
    // PART 2: DEMO USER (ID: 1268)
    // ==============================================================================
    console.log('👤 Configuring Demo User (ID 1268)...');

    const userId1268 = 1268;
    const userPassword = await bcrypt.hash('123456', 10);

    // Ensure user exists
    const demoUser = await prisma.user.upsert({
        where: { user_id: userId1268 },
        update: {
            role: 'bidder', // Ensure strict adherence to BIDDER role
        },
        create: {
            user_id: userId1268, // Force ID
            full_name: 'Demo Bidder',
            email: 'demo.bidder@auction-web.com',
            password: userPassword,
            role: 'bidder',
            address: '123 Demo Lane, Tech City',
            is_email_verified: true,
            created_at: new Date()
        }
    });
    console.log('   User 1268 verified/created.');

    // Ensure NOT Banned on Active Products
    // We'll delete any bans for this user on active products just in case
    const activeProductIds = activeProducts.map(p => p.product_id);
    const deleteBans = await prisma.banned_Bidder.deleteMany({
        where: {
            bidder_id: userId1268,
            product_id: { in: activeProductIds }
        }
    });
    if (deleteBans.count > 0) console.log(`   Removed ${deleteBans.count} accidental bans for User 1268.`);


    // 2.1 Watchlist/Favorites
    const watchlistProducts = getRandomSubset(allProducts, 8);
    let watchlistAdded = 0;
    for (const p of watchlistProducts) {
        // Avoid error if already exists
        try {
            await prisma.watchlist.upsert({
                where: { user_id_product_id: { user_id: userId1268, product_id: p.product_id } },
                create: { user_id: userId1268, product_id: p.product_id },
                update: {}
            });
            watchlistAdded++;
        } catch (e) {
            // ignore
        }
    }
    console.log(`   Added ${watchlistAdded} items to Watchlist.`);

    // 2.2 Product Questions
    const questionProducts = getRandomSubset(allProducts, 3);
    for (const p of questionProducts) {
        await prisma.product_Question.create({
            data: {
                product_id: p.product_id,
                asker_id: userId1268,
                question_text: "Can I get a discount as a demo user?",
                question_time: new Date()
            }
        });
    }
    console.log(`   User 1268 asked ${questionProducts.length} questions.`);


    // 2.3 Active Bids
    // We need to place bids on ACTIVE auctions.
    // We must ensure 1268 is the highest bidder on SOME, and losing on others.
    const auctionProducts = getRandomSubset(activeProducts.filter(p => p.seller_id !== userId1268), 5);

    for (let i = 0; i < auctionProducts.length; i++) {
        const p = auctionProducts[i];
        const isWinning = i < 3; // First 3 are winning

        // Determine bid amount
        let currentPrice = Number(p.current_price);
        const step = Number(p.step_price) || 10000;

        // If we want to win, we bid current + step
        // If not, maybe we bid current - step (simulating a past bid) OR we bid current + step but then someone else outbids us?
        // User request: "Place bids... some winning, some losing"
        // To represent "Losing", we can create a bid record for 1268, but update the product to have a HIGHER price/bidder.

        // 1. Create a bid for 1268
        const myBidAmount = currentPrice + step;

        await prisma.bid_History.create({
            data: {
                product_id: p.product_id,
                bidder_id: userId1268,
                max_bid_amount: myBidAmount,
                bid_time: new Date()
            }
        });

        if (isWinning) {
            // Update Product to make 1268 the current leader
            await prisma.product.update({
                where: { product_id: p.product_id },
                data: {
                    current_price: myBidAmount,
                    current_bidder_id: userId1268,
                    bid_count: { increment: 1 }
                }
            });
        } else {
            // LOSING scenario
            // 1268 Made a bid, but someone else made a higher one immediately
            const otherUser = getRandomElement(bidders.filter(u => u.user_id !== userId1268)) || bidders[0];
            const higherBid = myBidAmount + step;

            await prisma.bid_History.create({
                data: {
                    product_id: p.product_id,
                    bidder_id: otherUser.user_id,
                    max_bid_amount: higherBid,
                    bid_time: new Date(Date.now() + 1000) // 1 sec later
                }
            });

            await prisma.product.update({
                where: { product_id: p.product_id },
                data: {
                    current_price: higherBid,
                    current_bidder_id: otherUser.user_id,
                    bid_count: { increment: 2 } // 1268 + other
                }
            });
        }
    }
    console.log(`   User 1268 placed bids on ${auctionProducts.length} active auctions.`);


    // 2.4 Won Auctions
    // Ensure some PAST auctions are won by 1268.
    // We can convert some 'active' or take 'sold' products re-assign them.
    // Let's take 3 random products (active or sold) and force them to be SOLD to 1268.
    const wonCandidates = getRandomSubset(allProducts.filter(p => p.seller_id !== userId1268), 3);

    for (const p of wonCandidates) {
        const finalPrice = Math.max(Number(p.current_price), Number(p.start_price)) + 50000;

        // Create winning bid history if not present
        await prisma.bid_History.create({
            data: {
                product_id: p.product_id,
                bidder_id: userId1268,
                max_bid_amount: finalPrice,
                bid_time: new Date(Date.now() - 86400000 * 2) // 2 days ago
            }
        });

        // Update product
        await prisma.product.update({
            where: { product_id: p.product_id },
            data: {
                status: 'sold',
                winner_id: userId1268,
                current_bidder_id: userId1268,
                current_price: finalPrice,
                end_time: new Date(Date.now() - 86400000) // ended 1 day ago
            }
        });

        // Create Transaction (if not duplicates - check product_id unique constraint in Transaction model)
        // Transaction has @unique on product_id
        const existingTrans = await prisma.transaction.findUnique({ where: { product_id: p.product_id } });
        if (existingTrans) {
            // Update existing
            await prisma.transaction.update({
                where: { transaction_id: existingTrans.transaction_id },
                data: { buyer_id: userId1268, status: 'completed' }
            });
        } else {
            // Create new
            await prisma.transaction.create({
                data: {
                    product_id: p.product_id,
                    buyer_id: userId1268,
                    seller_id: p.seller_id,
                    status: 'completed',
                    payment_proof: 'auto-generated',
                    created_at: new Date()
                }
            });
        }
    }
    console.log(`   User 1268 assigned as winner for ${wonCandidates.length} products.`);


    // 2.5 Suggestions / Feedback
    // Add rating given by 1268
    // Use one of the won candidates
    if (wonCandidates.length > 0) {
        const p = wonCandidates[0];
        // Check if rating exists
        // Rating table doesn't have unique constraint on (product_id, rater_id). It's just an ID PK.
        // So we can just create one.
        await prisma.rating.create({
            data: {
                product_id: p.product_id,
                rater_id: userId1268,
                rated_user_id: p.seller_id,
                rating_value: 1,
                comment: "Excellent seller, very happy with my demo purchase!",
                created_at: new Date()
            }
        });
        console.log(`   User 1268 left feedback.`);
    }

    // 2.6 Notifications
    // Checked Schema: No 'Notification' table found.
    console.log('⚠️ Skipping Notifications: No Notification table defined in schema.prisma.');

    console.log('✅✅✅ Update Seed Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
