import jwt from "jsonwebtoken";
import prisma from '../lib/prisma.js';

const sessionMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { user_id: decoded.userId },
        select: { user_id: true, role: true },
      });
      if (user) {
        req.session = {
          authenticated: true,
          role: user.role,
          userId: user.user_id,
        };
      } else {
        req.session = {
          authenticated: false,
          role: "guest",
        };
      }
    } catch (err) {
      req.session = {
        authenticated: false,
        role: "guest",
      };
    }
  } else {
    req.session = {
      authenticated: false,
      role: "guest",
    };
  }

  next();
};

export default sessionMiddleware;
