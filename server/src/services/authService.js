import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

const hash = async (str) => {
  return await bcrypt.hash(str, SALT_ROUNDS);
};

const register = async ({ address, dob, email, full_name, password }) => {
  const hashedPassword = await hash(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      full_name,
      address,
      dob: dob ? new Date(dob) : null,
    },
  });
  return user;
};

const login = async ({ email, password }) => {
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
    },
  };
};

export default { register, login };
