import prisma from '../lib/prisma.js';

const getSystemConfig = async () => {
    const config = await prisma.system_Config.findMany();
    // Convert to object
    const configObj = {};
    config.forEach(c => {
        configObj[c.setting_key] = c.setting_value;
    });
    return configObj;
}

export default {
    getSystemConfig
};
