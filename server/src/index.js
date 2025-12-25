import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import upgradeRoutes from './routes/upgradeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/upgrades', upgradeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
