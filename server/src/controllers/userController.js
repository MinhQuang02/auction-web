import userService from '../services/userService.js';

const getProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id || parseInt(req.headers['user-id']);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID required' });
        }

        const user = await userService.getUserProfile(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    getProfile,
    updateProfile: async (req, res) => {
        try {
            const userId = req.user?.user_id || parseInt(req.headers['user-id']);
            const { full_name, address, email } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized: User ID required' });
            }

            const updatedUser = await userService.updateUserProfile(userId, {
                full_name,
                address,
                email
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error(error);
            if (error.code === 'P2002') {
                return res.status(409).json({ message: 'Email already exists' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};