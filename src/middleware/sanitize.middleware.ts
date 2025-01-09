import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

// enable/disable debugging for ffmpeg
const DEBUG_FFMPEG_ON = process.env.DEBUG_FFMPEG_ON === 'true';
const addFFmpegLogging = (command: ffmpeg.FfmpegCommand) => {
    if (DEBUG_FFMPEG_ON) {
        command
            .on("start", (commandLine) => {
                console.log(`FFmpeg command: ${commandLine}`);
            })
            .on("error", (err, stdout, stderr) => {
                console.error(`FFmpeg error: ${err.message}`);
                console.error(`FFmpeg stdout: ${stdout}`);
                console.error(`FFmpeg stderr: ${stderr}`);
            });
    }
    return command;
};

const sanitizeImage = async (inputBuffer: Buffer, outputPath: string) => {
    await sharp(inputBuffer)
        .toFormat("png")
        .toFile(outputPath);
};

const sanitizeVideo = async (inputBuffer: Buffer, outputPath: string) => {
    const tempInputPath = path.join('uploads_temp', `temp_${Date.now()}.mp4`);
    try {
        return await new Promise<void>((resolve, reject) => {
            fs.writeFileSync(tempInputPath, inputBuffer);

            const command = ffmpeg(tempInputPath)
                .output(outputPath)
                .videoCodec("libx264")
                .audioCodec("aac");

            addFFmpegLogging(command)
                .on("end", () => resolve())
                .on("error", reject)
                .run();
        });
    } finally {
        fs.unlinkSync(tempInputPath);
    }
};

const sanitizeAudio = async (inputBuffer: Buffer, outputPath: string) => {
    const tempInputPath = path.join('uploads_temp', `temp_${Date.now()}.mp3`);
    try {
        return await new Promise<void>((resolve, reject) => {
            fs.writeFileSync(tempInputPath, inputBuffer);

            const command = ffmpeg(tempInputPath)
                .output(outputPath)
                .audioCodec("libmp3lame")
                .format('mp3');

            addFFmpegLogging(command)
                .on("end", () => resolve())
                .on("error", reject)
                .run();
        });
    } finally {
        fs.unlinkSync(tempInputPath);
    }
};

const sanitizeFileMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        const { mimetype, buffer, originalname } = req.file;
        const sanitizedDir = 'uploads_sanitized';

        // define sanitizers for different media types
        type Sanitizer = (input: Buffer, output: string, params?: any) => Promise<void>;
        const sanitizers: Record<string, Sanitizer> = {
            'image/': async (input, output) => {
                await sanitizeImage(input, output);
            },
            'video/': async (input, output) => {
                await sanitizeVideo(input, output);
            },
            'audio/': async (input, output) => {
                await sanitizeAudio(input, output);
            },
        };

        // extensions are used for the output files
        const extensions: Record<string, string> = {
            'image/': 'png',
            'video/': 'mp4',
            'audio/': 'mp3',
        };

        const mediaType = Object.keys(sanitizers).find((key) => mimetype.startsWith(key));
        if (!mediaType) {
            return next(new Error('Unsupported file type'));
        }

        // final destination for a sanitized file
        const sanitizedFilePath = path.join(
            sanitizedDir,
            `${path.parse(originalname).name}.${extensions[mediaType]}`
        );

        try {
            await sanitizers[mediaType](buffer, sanitizedFilePath);

            req.file.path = sanitizedFilePath;
            req.file.filename = path.basename(sanitizedFilePath);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
};

export default sanitizeFileMiddleware;