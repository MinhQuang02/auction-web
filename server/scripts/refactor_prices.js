import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products. Updating prices...`);

    for (const product of products) {
        // 1. Generate Start Price: Random between $50 and $1000
        const startPrice = Math.floor(Math.random() * 950) + 50;

        // 2. Generate Step Price: ~5-10% of Start Price, rounded to nearest 5.
        let roughStep = startPrice * (0.05 + Math.random() * 0.05);
        let stepPrice = Math.ceil(roughStep / 5) * 5;
        if (stepPrice < 5) stepPrice = 5;

        // 3. Generate Current Price
        // Must be >= startPrice.
        // Simulate 0 to 15 bids.
        const simulatedBids = Math.floor(Math.random() * 10);
        const currentPrice = startPrice + (simulatedBids * stepPrice);

        // 4. Generate Buy Now Price
        // Must be > currentPrice.
        // Multiplier 1.2x to 2.5x of current
        const multiplier = 1.2 + Math.random() * 1.3;
        let buyNowPrice = Math.ceil((currentPrice * multiplier) / 10) * 10;

        // Ensure strict inequality
        if (buyNowPrice <= currentPrice) {
            buyNowPrice = currentPrice + (stepPrice * 5);
        }

        // 5. Update Product
        await prisma.product.update({
            where: { product_id: product.product_id },
            data: {
                start_price: startPrice,
                step_price: stepPrice,
                current_price: currentPrice,
                buy_now_price: buyNowPrice
            }
        });
    }

    console.log('All products updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
