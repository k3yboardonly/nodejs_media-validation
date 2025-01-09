export default function isValidFile(bytes: Uint8Array): boolean {
    console.log('----------------------------------------------------------');
    console.log('Checking if file is a valid MP3, MP4, JPEG, PNG, or GIF...');

    if (isMp3(bytes)) {
        console.log('File is a valid MP3');
        return true;  
    }

    if (isMp4(bytes)) {
        console.log('File is a valid MP4');
        return true;
    }

    if (isJpeg(bytes)) {
        console.log('File is a valid JPEG');
        return true;
    }

    if (isPng(bytes)) {
        console.log('File is a valid PNG');
        return true;
    }

    if (isGif(bytes)) {
        console.log('File is a valid GIF');
        return true;
    }

    console.log('File is neither MP3, MP4, JPEG, PNG, nor GIF');
    return false;
}

function isMp3(bytes: Uint8Array) {
    console.log('Checking file bytes for MP3...', bytes.slice(0, 10));  // log the first 10 bytes for inspection

    // Check for ID3v2 header at the start (3 bytes: "ID3")
    if (bytes.length > 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        console.log('ID3v2 header found');
        return true;
    }

    // Check for MPEG audio frame header (0xFF 0xFB at the start of audio frame)
    if (bytes.length > 4 && bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
        console.log('MPEG audio frame header found');
        return true;
    }

    console.log('Not an MP3 file');
    return false;
}

function isMp4(bytes: Uint8Array) {
    // Check for valid MP4 file by verifying the ftyp box
    if (bytes.length < 12) return false;  // Must have at least the size field and 'ftyp' box

    // Read the box size (first 4 bytes) and check 'ftyp' box
    const size = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];  // 4-byte size
    const boxType = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);

    if (boxType !== 'ftyp') {
        console.log('No ftyp box found');
        return false; 
    }

    // The 'ftyp' box should have a size field (after the 'ftyp' header)
    // The first 8 bytes are 'size' and 'ftyp', so check the next box types or 'moov'
    const majorBrand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);

    console.log(`Found ftyp box, major brand: ${majorBrand}`);

    // We should also verify the presence of the 'moov' box somewhere in the file
    if (!hasMoovBox(bytes)) {
        console.log('No moov box found in the MP4 file');
        return false;
    }

    return true;
}

function hasMoovBox(bytes: Uint8Array): boolean {
    // Scan for 'moov' box by checking for its box type in the file
    let i = 0;
    while (i < bytes.length - 8) {
        // Read the size of the current box
        const boxSize = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
        const boxType = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);

        if (boxType === 'moov') {
            console.log('Found moov box!');
            return true;
        }

        // Skip over the current box to check the next one
        i += boxSize;
    }

    return false;
}

function isJpeg(bytes: Uint8Array) {
    console.log('Checking file bytes for JPEG...', bytes.slice(0, 10));

    // Check for JPEG SOI marker (0xFFD8) at the start and EOI marker (0xFFD9) at the end
    if (bytes.length > 2 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[bytes.length - 2] === 0xFF && bytes[bytes.length - 1] === 0xD9) {
        console.log('JPEG SOI and EOI markers found');
        return true;
    }

    console.log('Not a JPEG file');
    return false;
}

function isPng(bytes: Uint8Array) {
    console.log('Checking file bytes for PNG...', bytes.slice(0, 10));

    // Check for PNG signature (8 bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if (bytes.length > 8 && pngSignature.every((byte, index) => byte === bytes[index])) {
        console.log('PNG signature found');
        return true;
    }

    console.log('Not a PNG file');
    return false;
}

function isGif(bytes: Uint8Array) {
    console.log('Checking file bytes for GIF...', bytes.slice(0, 10));

    // Check for GIF signature (6 bytes: "GIF87a" or "GIF89a")
    const gif87aSignature = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
    const gif89aSignature = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
    if (bytes.length > 6 && (gif87aSignature.every((byte, index) => byte === bytes[index]) || gif89aSignature.every((byte, index) => byte === bytes[index]))) {
        console.log('GIF signature found');
        return true;
    }

    console.log('Not a GIF file');
    return false;
}