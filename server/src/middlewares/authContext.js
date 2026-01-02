import jwt from "jsonwebtoken";
import prisma from '../lib/prisma.js';

const authContext = async (req, res, next) => {
  req.auth = {
    authenticated: false,
    role: "guest",
    userId: null,
  };

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    // stay guest
  }

  next();
};

export default authContext;
