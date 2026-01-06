import express from "express";
import uploadController from "../controllers/uploadController.js";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
});

router.post("/", upload.single("file"), uploadController.uploadImage);

export default router;
