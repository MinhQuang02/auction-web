import ratingService from "../services/ratingService.js";

const postRating = async (req, res) => {
  try {
    const { product_id, rated_user_id, rating_value, comment } = req.body;
    const rater_id = req.auth.userId;

    const rating = await ratingService.addRating({
      rater_id,
      rated_user_id,
      product_id,
      rating_value,
      comment
    });

    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const userId = req.auth.userId; 
    const reviews = await ratingService.getReviewsByUserId(userId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default { postRating, getReviews };