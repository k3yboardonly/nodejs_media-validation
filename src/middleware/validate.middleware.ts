import { Request, Response, NextFunction } from "express";
import isValidFile from "../utils/bytechecks.utils";

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

const validateFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        const { mimetype, size, buffer } = req.file;

        if (!allowedMimeTypes.includes(mimetype)) {
            res.status(400).json({ message: 'Invalid file type. Only JPG, PNG, GIF, MP4, and MPEG are allowed.' });
        }

        if (size > FILE_SIZE_LIMIT) {
            res.status(400).json({ message: 'File size exceeds the limit of 5MB.' });
        }

        // Validate the file's content using byte checks
        if (!isValidFile(new Uint8Array(buffer))) {
            res.status(400).json({ message: 'Invalid file content according to byte check' });
        }
    }

    next();
};

export default validateFileMiddleware;