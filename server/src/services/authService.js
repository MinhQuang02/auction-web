import prisma from '../lib/prisma.js';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import generateOtp from "../utils/generateOtp.js";
import transporter from "../utils/mailer.js";
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

    await transporter.sendMail({
      from: `"Your App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${otp}`,
    });
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

    if (!user) return;

    if (!user.password) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await hash(rawToken);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        reset_token_hash: hashedToken,
        reset_token_expires: expires,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      text: `Reset your password here:\n\n${resetLink}\n\nThis link expires in 15 minutes.`,
    });
  }

  async resetPassword({ token, password }) {
    if (password.length < 6) {
      throw new Error("Password too short");
    }

    const users = await prisma.user.findMany({
      where: {
        reset_token_hash: { not: null },
        reset_token_expires: { gt: new Date() },
      },
    });

    let matchedUser = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.reset_token_hash);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new Error("Invalid or expired token");
    }

    const newHashedPassword = await hash(password);

    await prisma.user.update({
      where: { user_id: matchedUser.user_id },
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
