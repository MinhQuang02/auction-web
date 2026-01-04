import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Recalculating User Ratings...');
    console.log('Formula: (Positive_Ratings / Total_Ratings) * 5');

    // 1. Fetch all users
    const users = await prisma.user.findMany({
        select: { user_id: true, full_name: true }
    });

    console.log(`Found ${users.length} users to process.`);

    let updatedCount = 0;

    for (const user of users) {
        const userId = user.user_id;

        // 2. Fetch Ratings for this user
        const ratings = await prisma.rating.findMany({
            where: { rated_user_id: userId }
        });

        const totalRatings = ratings.length;

        let newScore = 0;

        if (totalRatings > 0) {
            // Count positive ratings (+1)
            // Assuming rating_value > 0 means positive (Like)
            const positiveCount = ratings.filter(r => r.rating_value > 0).length;

            // Calculate score on 5-point scale
            const ratio = positiveCount / totalRatings;
            newScore = ratio * 5;
        }

        // 3. Update User
        // Note: avg_rating is Decimal(3,2), Prisma handles standard JS numbers well.
        await prisma.user.update({
            where: { user_id: userId },
            data: {
                avg_rating: newScore,
                total_ratings: totalRatings
            }
        });

        updatedCount++;
        if (totalRatings > 0) {
            console.log(`User ${user.full_name} (ID: ${userId}): ${newScore.toFixed(2)} / 5.0 (${totalRatings} reviews)`);
        }
    }

    console.log(`\nSuccessfully updated ratings for ${updatedCount} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
