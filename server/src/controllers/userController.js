import userService from '../services/userService.js';

const register = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 'EMAIL_EXISTS') return res.status(409).json(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const verify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await userService.verifyOTP(email, otp);
        res.status(200).json(result);
    } catch (error) {
        if (error.code === 'INVALID_OTP') return res.status(400).json(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error.code === 'AUTH_FAILED') return res.status(401).json(error);
        if (error.code === 'NOT_VERIFIED') return res.status(403).json(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const user = await userService.getUserProfile(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export default { register, verify, login, getProfile, updateProfile };