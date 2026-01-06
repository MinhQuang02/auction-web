import supabase from "../lib/supabase.js";

import { removeBackground } from "@imgly/background-removal-node";
import path from "path";
import { fileURLToPath } from "url";
import { Blob } from "buffer"; // Ensure Blob is available if not global

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Point to local models in node_modules to avoid fetching from CDN or missing path
const modelPath = path.resolve(__dirname, "../../node_modules/@imgly/background-removal-node/dist") + path.sep;
const publicPath = "file://" + modelPath.replace(/\\/g, "/");

const config = {
    publicPath: publicPath,
    debug: false,
    model_path: publicPath,
};

const uploadController = {
    uploadImage: async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            // Generate unique filename
            const timestamp = Date.now();
            let name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

            // Ensure name ends with .png for the processed file
            name = name.substring(0, name.lastIndexOf('.')) || name;
            const fileName = `uploads/${timestamp}_${name}.png`;

            // 1. Remove Background
            // Convert Buffer to Blob for imgly
            const inputBlob = new Blob([file.buffer], { type: file.mimetype });

            const processedBlob = await removeBackground(inputBlob, config);
            const processedBuffer = Buffer.from(await processedBlob.arrayBuffer());

            // 2. Upload to Supabase Storage (bucket: 'product')
            const { data, error } = await supabase.storage
                .from("product")
                .upload(fileName, processedBuffer, {
                    contentType: "image/png", // Always PNG after BG removal
                    upsert: true,
                });

            if (error) {
                throw new Error(error.message);
            }

            // 3. Get Public URL
            const { data: publicData } = supabase.storage
                .from("product")
                .getPublicUrl(fileName);

            res.status(200).json({
                message: "Upload successful (BG Removed)",
                url: publicData.publicUrl,
                fileName: fileName,
            });
        } catch (err) {
            console.error("Upload/Processing error:", err);
            res.status(500).json({ message: "Upload failed: " + err.message });
        }
    },
};

export default uploadController;
