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
import authContext from "./middlewares/authContext.js";

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});