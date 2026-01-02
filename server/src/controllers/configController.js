import configService from "../services/configService.js";

const getConfig = async (req, res) => {
    try {
        const config = await configService.getSystemConfig();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { getConfig };
