# Media Validator and Sanitizer

## Purpose

The purpose of this project is to provide a minimalistic example of a media validation and sanitization system using Node.js and Express. The goal is to ensure that uploaded files are of valid types and sizes, and to sanitize them before saving them to the server for further processing (for example uploading to a file storage). 
The project is focusing on media files including image, audio and video files. For simplicity purposes we work with a limited amount of formats: 'jpeg/png/gif', 'mp4' and 'mp3'.

## Motivation
It is a common use case for many web application to enable users to upload media files. 
However, before allowing a file to be stored in our application we want to perform checks on it and make sure it is a valid and clean media file. Especially if we then serve the media files to other users of the application - security is an all-important concern.

## Additional thoughts
There are tools out there for performing file checks for us, yet most of them are too expensive for a single developer who wants to build an application with media uploads and secure their users. This projects aims at achieving the maximal possible safety when dealing with file uploads by utilizing open source software only, so any developer can take it into use without paying subscriptions for their MVP product and migrate later to a paid tool if needed.
I believe it is impossible to mitigate all possible attacks through malicious media files. But we can at least try and make an attack more expensive then it is worth hacking a little web application.
I would be very happy to get additional feedback for the approach in this project and hope to make it more secure and robust together.

## Project Structure

- `src/index.ts`: The main entry point of the application.
- `src/middleware/validate.middleware.ts`: Middleware for validating the uploadeded files by size, mime type and common byte signatures in their byte arrays.
- `src/middleware/sanitize.middleware.ts`: Middleware for sanitizing the uploaded files by creating new files from the origins.
- `src/utils/bytechecks.utils.ts`: Utility functions for checking the validity of file types based on their byte content.
- `uploads_sanitized/`: Directory for storing sanitized files.
- `uploads_temp/`: Directory for storing temporary files during the sanitization process.

## Flow of Validation and Sanitization

1. **File Upload**: The user uploads a file through an API endpoint (`/api/upload`).

2. **Memory Storage**: The file is stored in memory using `multer`'s memory storage option before it is written into the file system.

3. **Validation Middleware**:
    - The `validateFileMiddleware` checks the file's MIME type, size and common byte signatures.
    - It reads the file bytes from memory and validates the file type using byte checks (e.g., checking for valid MP3, MP4, JPEG, PNG, or GIF signatures).
    - If the file is invalid, an error response is returned.

4. **Temporary Storage**: If the file passes validation, it is temporarily saved to the `uploads_temp` directory.

5. **Sanitization Middleware**:
    - The `sanitizeFileMiddleware` processes the file based on its type:
        - **Images**: Converted to PNG format using `sharp`.
        - **Videos**: Processed using `ffmpeg` to ensure they are in a safe format.
        - **Audio**: Processed using `ffmpeg` to ensure they are in a safe format.
    - The sanitized file is saved to the `uploads_sanitized` directory.
    - The temporary file is deleted after sanitization.

6. **Response**: A response is sent back to the client indicating that the file has been uploaded and sanitized successfully, along with details about the sanitized file.

## Running the Project

1. **Install Dependencies**:
    ```sh
    npm install
    ```

2. **Run the Server**:
    ```sh
    npm run dev
    ```

3. **Environment Variables**:
    - `DEBUG_FFMPEG_ON`: Set to `true` to enable FFmpeg debugging logs.

## Example Request

To upload a file and validate&sanitize it, send a POST request to `/api/upload`. 
Choose "form-data" as the body and add a key "file" with your test media file as it's value.