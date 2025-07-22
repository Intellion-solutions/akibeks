"use strict";
/**
 * Attachment Compression Utilities
 * Handles compression of files before storing in database
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompressionStats = exports.compressFiles = exports.getAttachment = exports.saveAttachment = exports.compressFile = exports.decompressString = exports.compressText = exports.compressImage = void 0;
/**
 * Compress image files using canvas
 */
const compressImage = async (file, options = {}) => {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080, format = 'webp' } = options;
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            canvas.width = width;
            canvas.height = height;
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            const mimeType = `image/${format}`;
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to compress image'));
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result.split(',')[1];
                    resolve({
                        data: base64Data,
                        originalSize: file.size,
                        compressedSize: blob.size,
                        compressionRatio: (1 - blob.size / file.size) * 100,
                        mimeType,
                        filename: file.name
                    });
                };
                reader.readAsDataURL(blob);
            }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};
exports.compressImage = compressImage;
/**
 * Compress text-based files using gzip-like compression
 */
const compressText = async (file) => {
    const text = await file.text();
    const compressed = await compressString(text);
    return {
        data: compressed,
        originalSize: file.size,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / file.size) * 100,
        mimeType: file.type,
        filename: file.name
    };
};
exports.compressText = compressText;
/**
 * Simple string compression using LZ-like algorithm
 */
const compressString = async (str) => {
    // Use built-in compression if available (modern browsers)
    if ('CompressionStream' in window) {
        try {
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            const encoder = new TextEncoder();
            const chunks = [];
            // Start reading
            const readPromise = (async () => {
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value)
                        chunks.push(value);
                }
            })();
            // Write data
            await writer.write(encoder.encode(str));
            await writer.close();
            await readPromise;
            // Convert to base64
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            return btoa(String.fromCharCode(...compressed));
        }
        catch (error) {
            console.warn('Native compression failed, using fallback:', error);
        }
    }
    // Fallback: simple RLE compression
    return simpleCompress(str);
};
/**
 * Simple Run-Length Encoding compression
 */
const simpleCompress = (str) => {
    let compressed = '';
    let i = 0;
    while (i < str.length) {
        let count = 1;
        const char = str[i];
        while (i + count < str.length && str[i + count] === char && count < 255) {
            count++;
        }
        if (count > 3 || char === '\n' || char === ' ') {
            compressed += `~${count}${char}`;
        }
        else {
            compressed += char.repeat(count);
        }
        i += count;
    }
    return btoa(compressed);
};
/**
 * Decompress string
 */
const decompressString = (compressed) => {
    try {
        const decoded = atob(compressed);
        let decompressed = '';
        let i = 0;
        while (i < decoded.length) {
            if (decoded[i] === '~') {
                const countStr = decoded.substring(i + 1, decoded.indexOf(decoded[i + 1]) !== -1 ? decoded.indexOf(decoded[i + 1], i + 1) : i + 4);
                const count = parseInt(countStr);
                const char = decoded[i + 1 + countStr.length];
                decompressed += char.repeat(count);
                i += 2 + countStr.length;
            }
            else {
                decompressed += decoded[i];
                i++;
            }
        }
        return decompressed;
    }
    catch (error) {
        console.error('Decompression failed:', error);
        return compressed;
    }
};
exports.decompressString = decompressString;
/**
 * Main compression function that handles different file types
 */
const compressFile = async (file, options = {}) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') ||
        file.type === 'application/json' ||
        file.type === 'application/xml' ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.xml') ||
        file.name.endsWith('.csv');
    if (isImage) {
        return (0, exports.compressImage)(file, options);
    }
    else if (isText) {
        return (0, exports.compressText)(file);
    }
    else {
        // For other file types, convert to base64 without compression
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    data: base64Data,
                    originalSize: file.size,
                    compressedSize: file.size, // No compression
                    compressionRatio: 0,
                    mimeType: file.type,
                    filename: file.name
                });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
};
exports.compressFile = compressFile;
/**
 * Save compressed attachment to database
 */
const saveAttachment = async (file, options = {}) => {
    const compressed = await (0, exports.compressFile)(file, options);
    const attachment = {
        id: crypto.randomUUID(),
        filename: compressed.filename,
        mimeType: compressed.mimeType,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        compressionRatio: compressed.compressionRatio,
        data: compressed.data,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    // In a real application, save to database here
    console.log('Saving attachment:', {
        filename: attachment.filename,
        originalSize: `${(attachment.originalSize / 1024).toFixed(2)} KB`,
        compressedSize: `${(attachment.compressedSize / 1024).toFixed(2)} KB`,
        compressionRatio: `${attachment.compressionRatio.toFixed(1)}%`
    });
    return attachment;
};
exports.saveAttachment = saveAttachment;
/**
 * Retrieve and decompress attachment from database
 */
const getAttachment = async (id) => {
    // In a real application, fetch from database here
    // For now, return a placeholder
    throw new Error('Not implemented - integrate with your database');
};
exports.getAttachment = getAttachment;
/**
 * Batch compress multiple files
 */
const compressFiles = async (files, options = {}, onProgress) => {
    const results = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const attachment = await (0, exports.saveAttachment)(file, options);
            results.push(attachment);
            if (onProgress) {
                onProgress((i + 1) / files.length * 100, i + 1, files.length);
            }
        }
        catch (error) {
            console.error(`Failed to compress file ${file.name}:`, error);
        }
    }
    return results;
};
exports.compressFiles = compressFiles;
/**
 * Get compression statistics
 */
const getCompressionStats = (attachments) => {
    const totalOriginalSize = attachments.reduce((sum, att) => sum + att.originalSize, 0);
    const totalCompressedSize = attachments.reduce((sum, att) => sum + att.compressedSize, 0);
    const averageCompressionRatio = attachments.reduce((sum, att) => sum + att.compressionRatio, 0) / attachments.length;
    return {
        totalFiles: attachments.length,
        totalOriginalSize,
        totalCompressedSize,
        totalSaved: totalOriginalSize - totalCompressedSize,
        averageCompressionRatio,
        spaceSavedPercentage: (1 - totalCompressedSize / totalOriginalSize) * 100
    };
};
exports.getCompressionStats = getCompressionStats;
//# sourceMappingURL=compression.js.map