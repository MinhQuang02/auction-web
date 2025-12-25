import upgradeService from '../services/upgradeService.js';

const requestUpgrade = async (req, res) => {
    try {
        const userId = 20;

        const request = await upgradeService.createUpgradeRequest(userId);
        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Only bidders can request upgrade' || error.message === 'Upgrade request already sent') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await upgradeService.getPendingRequests();
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    requestUpgrade,
    getRequests
};
