import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authContext = async (req, res, next) => {
  req.auth = {
    authenticated: false,
    role: "guest",
    userId: null,
  };

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.userId },
      select: { user_id: true, role: true },
    });

    if (!user) return next();

    req.auth = {
      authenticated: true,
      role: user.role,
      userId: user.user_id,
    };
  } catch {
    // intentionally downgrade to guest
  }

  next();
};

export default authContext;
