import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables in public schema:', result);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
