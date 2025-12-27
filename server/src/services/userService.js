import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailService from '../utils/emailService.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// 1. REGISTER
const registerUser = async (data) => {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw { code: 'EMAIL_EXISTS', message: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    // Create User (Inactive)
    const newUser = await prisma.user.create({
        data: {
            full_name: data.full_name,
            email: data.email,
            password: hashedPassword,
            address: data.address,
            role: 'bidder', // Default role
            otp: otp,
            otp_expires: otpExpires,
            is_email_verified: false
        }
    });

    // Send OTP
    await emailService.sendOTP(data.email, otp);

    return { message: 'Registration successful. Please verify OTP.', userId: newUser.user_id };
};

// 2. VERIFY OTP
const verifyOTP = async (email, otp) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };
    if (user.is_email_verified) return { message: 'Email already verified' };

    if (user.otp !== otp || new Date() > user.otp_expires) {
        throw { code: 'INVALID_OTP', message: 'Invalid or expired OTP' };
    }

    // Activate user
    await prisma.user.update({
        where: { user_id: user.user_id },
        data: { is_email_verified: true, otp: null, otp_expires: null }
    });

    return { message: 'Email verified successfully. You can now login.' };
};

// 3. LOGIN
const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw { code: 'AUTH_FAILED', message: 'Invalid email or password' };
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { code: 'AUTH_FAILED', message: 'Invalid email or password' };

    if (!user.is_email_verified) throw { code: 'NOT_VERIFIED', message: 'Please verify your email first' };

    // Generate Token
    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

// 4. GET PROFILE
const getUserProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: { user_id: userId },
        select: { user_id: true, full_name: true, email: true, address: true, role: true, created_at: true }
    });
};

// 5. UPDATE PROFILE
const updateUserProfile = async (userId, data) => {
    // Basic update logic (omitted email update complexity for brevity)
    return await prisma.user.update({
        where: { user_id: userId },
        data: data
    });
};

export default {
    registerUser,
    verifyOTP,
    loginUser,
    getUserProfile,
    updateUserProfile
};