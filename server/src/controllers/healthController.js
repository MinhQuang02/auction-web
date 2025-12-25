const checkHealth = (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
};

export default {
    checkHealth,
};