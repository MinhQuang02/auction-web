import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`[${new Date().toISOString()}] Starting product status synchronization...`);

    try {
        const now = new Date();

        // Fetch all products that have ended but are not yet marked as final
        // status NOT IN ['sold', 'ended_no_winner', 'removed']
        // effectively checking for 'active' (or any other intermediate status if existed)
        // and end_time < now
        const expiredProducts = await prisma.product.findMany({
            where: {
                end_time: {
                    lt: now,
                },
                status: {
                    notIn: ['sold', 'ended_no_winner', 'removed']
                }
            }
        });

        console.log(`Found ${expiredProducts.length} products to synchronize.`);

        let updatedCount = 0;

        for (const product of expiredProducts) {
            // Logic 1: Leading bidder exists
            if (product.current_bidder_id) {
                // Update to SOLD and assign winner
                await prisma.product.update({
                    where: { product_id: product.product_id },
                    data: {
                        status: 'sold',
                        winner_id: product.current_bidder_id
                    }
                });
                console.log(`Product ${product.product_id}: Status updated to SOLD. Winner ID: ${product.current_bidder_id}`);
            }
            // Logic 2: No bidder
            else {
                // Update to ENDED_NO_WINNER
                await prisma.product.update({
                    where: { product_id: product.product_id },
                    data: {
                        status: 'ended_no_winner'
                    }
                });
                console.log(`Product ${product.product_id}: Status updated to ENDED_NO_WINNER. No bidders.`);
            }
            updatedCount++;
        }

        console.log(`[${new Date().toISOString()}] Synchronization complete. Processed ${updatedCount} products.`);

    } catch (error) {
        console.error('Error during synchronization:');
        console.error(error.message || error);
        // console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the function
main();
