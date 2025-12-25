import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            user_id: userId,
        },
    });
    return user;
};

const updateUserProfile = async (userId, data) => {
    if (data.email) {
        const currentUser = await prisma.user.findUnique({
            where: {
                user_id: userId,
            },
            select: {
                email: true,
            },
        });

        if (currentUser && currentUser.email !== data.email) {
            data.is_email_verified = false;
        }
    }

    const updateData = {};
    if (data.full_name) updateData.full_name = data.full_name;
    if (data.address) updateData.address = data.address;
    if (data.email) updateData.email = data.email;
    if (data.is_email_verified === false) updateData.is_email_verified = false;

    const updatedUser = await prisma.user.update({
        where: {
            user_id: userId,
        },
        data: updateData,
    });

    return updatedUser;
};

export default {
    getUserProfile,
    updateUserProfile,
};
