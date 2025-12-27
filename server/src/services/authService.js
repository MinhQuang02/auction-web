import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateOtp from "../utils/generateOtp.js";
import transporter from "../utils/mailer.js";

const prisma = new PrismaClient();
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

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
}

const authService = new AuthService();
export default authService;
