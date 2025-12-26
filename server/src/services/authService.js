import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

const hash = async (str) => {
  return bcrypt.hash(str, SALT_ROUNDS);
};

class AuthService {
  async register({ address, dob, email, full_name, password }) {
    const hashedPassword = await hash(password);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        full_name,
        address,
        dob: dob ? new Date(dob) : null,
      },
    });
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
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
}

const authService = new AuthService();
export default authService;
