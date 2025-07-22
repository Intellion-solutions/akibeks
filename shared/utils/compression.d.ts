/**
 * Attachment Compression Utilities
 * Handles compression of files before storing in database
 */
interface CompressedFile {
    data: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    mimeType: string;
    filename: string;
}
interface CompressionOptions {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'webp' | 'jpeg' | 'png';
}
/**
 * Compress image files using canvas
 */
export declare const compressImage: (file: File, options?: CompressionOptions) => Promise<CompressedFile>;
/**
 * Compress text-based files using gzip-like compression
 */
export declare const compressText: (file: File) => Promise<CompressedFile>;
/**
 * Decompress string
 */
export declare const decompressString: (compressed: string) => string;
/**
 * Main compression function that handles different file types
 */
export declare const compressFile: (file: File, options?: CompressionOptions) => Promise<CompressedFile>;
/**
 * Database attachment storage with compression
 */
export interface DatabaseAttachment {
    id: string;
    filename: string;
    mimeType: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    data: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Save compressed attachment to database
 */
export declare const saveAttachment: (file: File, options?: CompressionOptions) => Promise<DatabaseAttachment>;
/**
 * Retrieve and decompress attachment from database
 */
export declare const getAttachment: (id: string) => Promise<Blob>;
/**
 * Batch compress multiple files
 */
export declare const compressFiles: (files: File[], options?: CompressionOptions, onProgress?: (progress: number, current: number, total: number) => void) => Promise<DatabaseAttachment[]>;
/**
 * Get compression statistics
 */
export declare const getCompressionStats: (attachments: DatabaseAttachment[]) => {
    totalFiles: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSaved: number;
    averageCompressionRatio: number;
    spaceSavedPercentage: number;
};
export {};
//# sourceMappingURL=compression.d.ts.map