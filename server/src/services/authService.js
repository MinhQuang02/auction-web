import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

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

export default { register };
