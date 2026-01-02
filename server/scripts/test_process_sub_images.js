import { removeBackground } from "@imgly/background-removal-node";
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cliProgress from 'cli-progress';
import { Jimp } from 'jimp';

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
// Fix: Key might be under different names
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.STORAGE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase keys.");
    process.exit(1);
}

// Clients
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

// HELPER: Resize and Center Image using Jimp (Pure JS)
async function processAndCenterImage(buffer) {
    try {
        // Read image
        const image = await Jimp.read(buffer);

        // 1. Trim transparency (autocrop)
        image.autocrop();

        // 2. Scale to fit 800x800
        image.contain({ w: 800, h: 800 });

        // 3. Get buffer
        const processedBuffer = await image.getBuffer("image/png");

        return processedBuffer;
    } catch (e) {
        console.error("Jimp processing error:", e);
        return buffer;
    }
}

async function main() {
    console.log("🚀 Starting Sub-Image Processing Test (Limit 3)...");

    try {
        await prisma.$connect();

        // Fetch 3 random images from Product_Image
        const images = await prisma.product_Image.findMany({
            take: 3,
            select: { image_id: true, image_url: true }
        });

        console.log(`📦 Found ${images.length} images to process.`);

        for (const img of images) {
            console.log(`Processing Image ID: ${img.image_id}`);
            const originalUrl = img.image_url;

            // Skip if placeholder or already processed (simple check)
            if (originalUrl.includes('sub-product')) {
                console.log("  -> Already processed.");
                continue;
            }

            try {
                // A. Download
                const response = await fetch(originalUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                const blob = await response.blob();

                // B. Remove Background
                const bgRemovedBlob = await removeBackground(blob, imglyConfig);
                const bgRemovedBuffer = Buffer.from(await bgRemovedBlob.arrayBuffer());

                // C. Resize & Center
                const finalBuffer = await processAndCenterImage(bgRemovedBuffer);

                // D. Upload to sub-product bucket
                const fileName = `processed_sub_${img.image_id}_${Date.now()}.png`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('sub-product')
                    .upload(fileName, finalBuffer, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) {
                    throw new Error(`Upload error: ${uploadError.message}`);
                }

                // E. Get Public URL
                const { data: publicUrlData } = supabase
                    .storage
                    .from('sub-product')
                    .getPublicUrl(fileName);

                const newUrl = publicUrlData.publicUrl;
                console.log(`  -> Uploaded to ${newUrl}`);

                // F. Update DB
                await prisma.product_Image.update({
                    where: { image_id: img.image_id },
                    data: { image_url: newUrl }
                });
                console.log("  -> DB Updated.");

            } catch (err) {
                console.error(`  ❌ Error: ${err.message}`);
            }
        }

    } catch (err) {
        console.error("Fatal Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
