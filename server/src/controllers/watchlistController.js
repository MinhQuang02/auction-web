import watchlistService from '../services/watchlistService.js';

const getWatchlist = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const watchlist = await watchlistService.getWatchlistByUserId(userId);
        res.status(200).json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addToWatchlist = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: "Product ID required" });
        }

        await watchlistService.addToWatchlist(userId, product_id);
        res.status(201).json({ message: "Added to watchlist" });
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ message: "Item already in watchlist" });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const removeWatchlist = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;

        await watchlistService.removeWatchlist(userId, id);
        res.status(200).json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Watchlist item not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    getWatchlist,
    addToWatchlist,
    removeWatchlist,
};