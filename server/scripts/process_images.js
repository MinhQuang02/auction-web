import { removeBackground } from "@imgly/background-removal-node";
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cliProgress from 'cli-progress';

// Setup paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Env
const parentEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(parentEnvPath)) {
    dotenv.config({ path: parentEnvPath });
}
dotenv.config();

// Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.STORAGE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase keys.");
    process.exit(1);
}

// 1. Setup Clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const prisma = new PrismaClient();

// Configure Imgly
const distPath = path.join(__dirname, 'dist') + path.sep;
const publicPath = 'file://' + distPath.replace(/\\/g, '/');
const imglyConfig = {
    publicPath: publicPath,
    debug: false,
    model_path: publicPath
};

async function main() {
    console.log("🚀 Starting Node.js Image Processing Pipeline (Prisma Edition)...");

    try {
        await prisma.$connect();
        console.log("✅ Connected to Database via Prisma.");

        // 2. Fetch Products
        // Query for valid products
        // main_image_url is required in schema, so we don't need to check for null
        const products = await prisma.product.findMany({
            select: {
                product_id: true,
                main_image_url: true
            }
        });

        console.log(`📦 Found ${products.length} products.`);

        // 3. Progress Bar
        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(products.length, 0);

        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const product of products) {
            const pid = product.product_id;
            const originalUrl = product.main_image_url;

            // Skip if already processed
            if (originalUrl.includes(SUPABASE_URL)) {
                skipCount++;
                bar.increment();
                continue;
            }

            try {
                // A. Download
                const response = await fetch(originalUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
                const blob = await response.blob();

                // B. Remove Background
                const processedBlob = await removeBackground(blob, imglyConfig);
                const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());

                // C. Upload
                const fileName = `processed_${pid}_${Date.now()}.png`;
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('product')
                    .upload(fileName, processedBuffer, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

                // Public URL
                const { data: publicUrlData } = supabase
                    .storage
                    .from('product')
                    .getPublicUrl(fileName);

                const newUrl = publicUrlData.publicUrl;

                // D. Update DB
                await prisma.product.update({
                    where: { product_id: pid },
                    data: { main_image_url: newUrl }
                });

                successCount++;

            } catch (err) {
                // console.error(`Failed ${pid}: ${err.message}`);
                failCount++;
            } finally {
                bar.increment();
            }
        }

        bar.stop();

        console.log("\n==========================================");
        console.log("✅ Processing Complete");
        console.log(`🟢 Successful: ${successCount}`);
        console.log(`🔴 Failed: ${failCount}`);
        console.log(`⚪ Skipped: ${skipCount}`);
        console.log("==========================================");

    } catch (err) {
        console.error("\n❌ Fatal Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
