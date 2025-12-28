<<<<<<< HEAD
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import upgradeRoutes from './routes/upgradeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
=======
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import upgradeRoutes from "./routes/upgradeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authContext from "./middleware/authContext.js";
>>>>>>> e8b3de108bc01005424c904bea16a3e03c50c268

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(authContext);

<<<<<<< HEAD
app.use('/', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/upgrades', upgradeRoutes);
app.use('/api/categories', categoryRoutes);
=======
app.use("/", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/upgrades", upgradeRoutes);
app.use("/api/auth", authRoutes);
>>>>>>> e8b3de108bc01005424c904bea16a3e03c50c268

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
