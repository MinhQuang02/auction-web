import watchlistService from '../services/watchlistService.js';

const getWatchlist = async (req, res) => {
    try {
        const userId = 20;

        const watchlist = await watchlistService.getWatchlistByUserId(userId);
        res.status(200).json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeWatchlist = async (req, res) => {
    try {
        const userId = 20;
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
    removeWatchlist,
};
