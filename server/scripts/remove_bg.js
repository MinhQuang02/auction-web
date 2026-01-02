import imglyRemoveBackground from "@imgly/background-removal-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error("Missing paths");
    process.exit(1);
}

// Local path to dist
// Using absolute file URL
const distPath = path.join(__dirname, 'dist') + path.sep;
const publicPath = 'file://' + distPath.replace(/\\/g, '/');

const config = {
    publicPath: publicPath,
    debug: true,
    model_path: publicPath // Sometimes needed?
};

try {
    // console.log("Using publicPath:", publicPath);
    const blob = await imglyRemoveBackground(inputPath, config);
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log("SUCCESS");
} catch (error) {
    console.error("BG_REMOVAL_ERROR:", error);
    process.exit(1);
}
