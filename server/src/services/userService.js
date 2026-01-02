import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      user_id: userId,
    },
    // Exclude password and other sensitive fields
    select: {
      user_id: true,
      full_name: true,
      email: true,
      address: true,
      is_email_verified: true,
      avg_rating: true,
      total_ratings: true,
      role: true
    }
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
        password: true // Need password if verifying
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

  // Handle Password Update
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new Error("Invalid current password");
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Invalid current password");
    }

    updateData.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  }

  const updatedUser = await prisma.user.update({
    where: {
      user_id: userId,
    },
    data: updateData,
    select: {
      user_id: true,
      full_name: true,
      email: true,
      address: true,
      is_email_verified: true,
      role: true
    }
  });

  return updatedUser;
};

export default {
  getUserProfile,
  updateUserProfile,
};
