import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import sanitizeFileMiddleware from "./middleware/sanitize.middleware";
import validateFileMiddleware from "./middleware/validate.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

app.post("/api/upload",
    upload.single("file"),
    validateFileMiddleware, // performing basic checks on the array buffer such as magic bytes
    sanitizeFileMiddleware, // creating new media files from the origin files
    (req, res) => {
        if (req.file) {
            console.log("File uploaded and sanitized successfully:");
            console.log(`Original name: ${req.file.originalname}`);
            console.log(`Sanitized path: ${req.file.path}`);
            console.log(`MIME type: ${req.file.mimetype}`);
            console.log(`Size: ${req.file.size} bytes`);
        } else {
            console.log("No file uploaded.");
        }
        res.json({ message: "File uploaded and sanitized successfully" });
    }
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});