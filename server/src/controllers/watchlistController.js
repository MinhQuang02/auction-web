import watchlistService from '../services/watchlistService.js';

const getWatchlist = async (req, res) => {
    try {
        const userId = req.user?.user_id || parseInt(req.headers['user-id']);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID required' });
        }

        const watchlist = await watchlistService.getWatchlistByUserId(userId);
        res.status(200).json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeWatchlist = async (req, res) => {
    try {
        const userId = req.user?.user_id || parseInt(req.headers['user-id']);
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID required' });
        }

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