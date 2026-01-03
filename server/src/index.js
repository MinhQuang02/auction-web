import "dotenv/config";
import express from "express";
import cors from "cors";

// Import Routes
import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import upgradeRoutes from "./routes/upgradeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authContext from "./middlewares/authContext.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import requireRole from "./middlewares/requireRole.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// 1. ADD THIS LOGGER RIGHT HERE (Before AuthContext)
app.use((req, res, next) => {
  next();
});

app.use(authContext);

// Register Routes
app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/upgrades", upgradeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/config", configRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/admin/products", requireRole("admin"), adminProductRoutes);
app.use("/api/admin/users", requireRole("admin"), adminUserRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
