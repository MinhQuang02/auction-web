import prisma from '../lib/prisma.js';

const addRating = async ({ rater_id, rated_user_id, product_id, rating_value, comment }) => {
  // 1. Check if rating already exists
  const existing = await prisma.rating.findFirst({
    where: {
      product_id: parseInt(product_id),
      rater_id: parseInt(rater_id),
      rated_user_id: parseInt(rated_user_id)
    }
  });

  if (existing) {
    throw new Error("You have already rated this user for this product.");
  }

  // 2. Create Rating
  const rating = await prisma.rating.create({
    data: {
      product_id: parseInt(product_id),
      rater_id: parseInt(rater_id),
      rated_user_id: parseInt(rated_user_id),
      rating_value: parseInt(rating_value), // 1 or -1
      comment
    }
  });

  // 3. Update User's Average Rating
  // Aggregate all ratings for the target user
  const aggregations = await prisma.rating.aggregate({
    where: { rated_user_id: parseInt(rated_user_id) },
    _sum: { rating_value: true },
    _count: { rating_value: true }
  });

  const totalScore = aggregations._sum.rating_value || 0;
  const totalCount = aggregations._count.rating_value || 0;

  const newAvg = totalCount > 0 ? (totalScore / totalCount) : 0;

  await prisma.user.update({
    where: { user_id: parseInt(rated_user_id) },
    data: {
      avg_rating: newAvg,
      total_ratings: totalCount
    }
  });

  return rating;
};

const getReviewsByUserId = async (userId) => {
  const reviews = await prisma.rating.findMany({
    where: { rated_user_id: parseInt(userId) },
    include: {
      rater: {
        select: {
          full_name: true,
          address: true
        }
      }
    }
  });
  return reviews;
};

export default {
  addRating,
  getReviewsByUserId
};