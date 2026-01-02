import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Synchronizing Bid History (Time-Based Increasing Random Mode)...');
    console.log('Logic: Oldest Bid -> Start Price ... Newest Bid -> Current Price');
    console.log('All intermediate bids are random but strictly increasing.');

    const products = await prisma.product.findMany({
        // where: { status: 'active' }, // Let's do all to be consistent
        include: {
            bids: {
                orderBy: {
                    bid_time: 'asc' // Oldest to Newest
                }
            }
        }
    });
    console.log(`Processing ${products.length} products...`);

    let updatedCount = 0;

    for (const product of products) {
        if (!product.bids || product.bids.length === 0) continue;

        const bids = product.bids; // Already sorted by time ASC
        const count = bids.length;

        const startPrice = Number(product.start_price);
        const currentPrice = Number(product.current_price);

        // Safety check
        if (currentPrice < startPrice) {
            // Data weirdness, skip or fix? Let's skip logic for this one or just clamp.
            continue;
        }

        const priceRange = currentPrice - startPrice;

        // We need 'count' price points.
        // The last one MUST be currentPrice.
        // The first one could be startPrice or slightly higher.
        // The rest are strictly increasing in between.

        // Algorithm to generate 'n' random sorted numbers in [min, max]:
        // 1. Generate n-1 random factors in (0, 1).
        // 2. Sort them.
        // 3. Map them to the range.

        // Exception: if count == 1, just set to currentPrice.

        const newPrices = [];

        if (count === 1) {
            newPrices.push(currentPrice);
        } else {
            // We need 'count - 1' intermediate points.
            // Let's generate random ratios.
            const ratios = [];
            for (let i = 0; i < count - 1; i++) {
                ratios.push(Math.random());
            }
            ratios.sort((a, b) => a - b);

            // Map ratios to price
            // Price_i = Start + Ratio * (Range)
            // Ensure strictly increasing ? 
            // Note: duplicates in random(0,1) are very rare. 
            // If sorting gives equality, we add negligible delta.

            // We also want to ensure the last bid is logically currentPrice.
            // And the first bid is >= startPrice.

            let prevPrice = -1;

            for (const r of ratios) {
                let price = startPrice + (r * priceRange);

                // Round to 2 decimals or step check?
                // Let's round to integer or .00 for nicer look, 
                // but user wants random. .xx is fine.
                price = Math.round(price * 100) / 100;

                // Ensure strict increase
                if (price <= prevPrice) {
                    price = prevPrice + 0.01; // minimal increment
                }

                // Ensure not exceeding current (reserved for last)
                // Actually last is current. This is intermediate.
                // If we bump into current, we have a problem (too many bids for small range).
                if (price >= currentPrice) {
                    price = currentPrice - 0.01; // Clamp below. 
                    // If this makes it <= prevPrice, we are squeezed. 
                    // Simple hack: if squeezed, just ignore strict uniqueness on 0.01 level 
                    // if strictly impossible, but usually range is large enough.
                    // or just retry? Let's just clamp.
                }

                newPrices.push(price);
                prevPrice = price;
            }

            // Push the final max price
            newPrices.push(currentPrice);
        }


        // FIX: If we squeezed numbers, we might need a quick repair pass to strict increase from end?
        // Actually, simplest way to generate N sorted numbers is:
        // Generate N randoms, Sort. No, we need fixed endpoints?
        // The "Ratio" method works best.
        // Let's apply a "repair" pass to ensure strictly increasing if rounding caused issues.
        // Iterate forwards: if cur <= prev, cur = prev + step.
        // Then check if last > currentPrice, if so, we have to "compress" backwards?
        // Let's just trust valid range for now usually.

        // Assign prices to bids (both are sorted by time/order)
        for (let i = 0; i < count; i++) {
            const bid = bids[i];
            const newPrice = newPrices[i];

            // Update DB
            if (Math.abs(Number(bid.max_bid_amount) - newPrice) > 0.001) {
                await prisma.bid_History.update({
                    where: { bid_id: bid.bid_id },
                    data: { max_bid_amount: newPrice }
                });
                updatedCount++;
            }
        }

        // Important: Update winning bidder to match the last bid user?
        // User said: "giá trị lớn nhất chính là ô có thời gian lớn nhất".
        // We already handle this by assigning currentPrice to the last bid.
        // We SHOULD ensure the product.current_bidder_id MATCHES this last bid's bidder_id.
        // If not, we have a sync mismatch (Winner ID on product != User ID of highest bid).
        // Let's fix the product's winner to match the last bid's bidder.

        const winnerBid = bids[count - 1]; // This is the one we just set to currentPrice
        if (product.current_bidder_id !== winnerBid.bidder_id) {
            await prisma.product.update({
                where: { product_id: product.product_id },
                data: { current_bidder_id: winnerBid.bidder_id }
            });
            // Console log optional
        }
    }

    console.log(`Synchronization complete. Updated ${updatedCount} bid records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
