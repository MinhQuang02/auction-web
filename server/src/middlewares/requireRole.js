const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth.authenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export default requireRole;
