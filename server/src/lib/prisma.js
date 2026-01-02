import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Create a singleton instance
// Ensure environment variables are loaded before instantiation
dotenv.config();

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['error', 'warn'], // Optional: logs
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
