import prisma from '../lib/prisma.js';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import generateOtp from "../utils/generateOtp.js";
import emailService from "./emailService.js";
import { OAuth2Client } from "google-auth-library";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const hash = (str) => bcrypt.hash(str, SALT_ROUNDS);

class AuthService {
  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    if (!user.is_email_verified) {
      throw new Error("Email not verified");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set");
    }

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    return {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId) {
    return prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });
  }

  async registerAndSendOtp({ email, password, full_name, address, dob }) {
    const hashedPassword = await hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        full_name,
        address,
        dob: dob ? new Date(dob) : null,
        is_email_verified: false,
      },
    });

    const otp = generateOtp();
    const otpHash = await hash(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        otp: otpHash,
        otp_expires: expires,
      },
    });

    await emailService.sendOtp(email, otp);
  }

  async verifyEmail({ email, otp }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp || !user.otp_expires) {
      throw new Error("Invalid request");
    }

    if (user.otp_expires < new Date()) {
      throw new Error("OTP expired");
    }

    const valid = await bcrypt.compare(otp, user.otp);
    if (!valid) {
      throw new Error("Invalid OTP");
    }

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        is_email_verified: true,
        otp: null,
        otp_expires: null,
      },
    });
  }

  async googleSignIn({ token }) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const full_name = payload.name;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          full_name,
          password: null,
          role: "bidder",
          is_email_verified: true,
        },
      });
    }

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

    const jwtToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return {
      token: jwtToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return; // Silent fail security

    // Generate 6-digit OTP
    const otp = generateOtp();
    const hashedOtp = await hash(otp);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        reset_token_hash: hashedOtp, // Reusing this field for OTP hash
        reset_token_expires: expires,
      },
    });

    // Send OTP Email
    await emailService.sendOtp(user.email, otp, 'reset');
  }

  async resetPassword({ email, otp, password }) {
    if (!email || !otp || !password) {
      throw new Error("Missing required fields");
    }

    if (password.length < 6) {
      throw new Error("Password too short");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.reset_token_hash || !user.reset_token_expires) {
      throw new Error("Invalid request");
    }

    if (user.reset_token_expires < new Date()) {
      throw new Error("OTP expired");
    }

    const isMatch = await bcrypt.compare(otp, user.reset_token_hash);
    if (!isMatch) {
      throw new Error("Invalid OTP");
    }

    const newHashedPassword = await hash(password);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password: newHashedPassword,
        reset_token_hash: null,
        reset_token_expires: null,
      },
    });
  }
}

const authService = new AuthService();
export default authService;
