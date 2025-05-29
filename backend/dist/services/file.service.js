"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class FileService {
    static UPLOAD_DIR = env_1.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
    static MAX_FILE_SIZE = env_1.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB
    static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    static ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/zip'];
    /**
     * Initialize upload directories
     */
    static async initialize() {
        const dirs = ['products', 'avatars', 'documents', 'temp'].map(dir => path_1.default.join(this.UPLOAD_DIR, dir));
        for (const dir of dirs) {
            await fs_1.promises.mkdir(dir, { recursive: true });
        }
        logger_1.logger.info('File upload directories initialized');
    }
    /**
     * Upload a file
     */
    static async uploadFile(file, options) {
        try {
            // Validate file
            this.validateFile(file, options);
            // Generate unique filename
            const fileId = this.generateFileId();
            const ext = path_1.default.extname(file.originalname);
            const filename = `${fileId}${ext}`;
            // Determine upload path
            const uploadPath = this.getUploadPath(options.type, filename);
            // Process image if applicable
            if (this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                await this.processAndSaveImage(file.buffer, uploadPath);
            }
            else {
                await fs_1.promises.writeFile(uploadPath, file.buffer);
            }
            // Save file metadata to database
            const fileRecord = await prisma.file.create({
                data: {
                    id: fileId,
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: uploadPath,
                    type: options.type,
                    userId: options.userId,
                    productId: options.productId,
                    url: this.getFileUrl(options.type, filename),
                },
            });
            logger_1.logger.info('File uploaded successfully', { fileId, userId: options.userId });
            return {
                fileId: fileRecord.id,
                url: fileRecord.url,
                metadata: {
                    filename: fileRecord.filename,
                    size: fileRecord.size,
                    mimetype: fileRecord.mimetype,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('File upload failed', error);
            throw error;
        }
    }
    /**
     * Process and save image with optimization
     */
    static async processAndSaveImage(buffer, outputPath, options) {
        const image = (0, sharp_1.default)(buffer);
        // Apply processing options
        if (options?.width || options?.height) {
            image.resize(options.width, options.height, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }
        // Set quality
        const quality = options?.quality || 85;
        const format = options?.format || 'jpeg';
        switch (format) {
            case 'jpeg':
                image.jpeg({ quality });
                break;
            case 'png':
                image.png({ quality });
                break;
            case 'webp':
                image.webp({ quality });
                break;
        }
        await image.toFile(outputPath);
    }
    /**
     * Generate image thumbnails
     */
    static async generateThumbnails(fileId, sizes) {
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        if (!file) {
            throw new errors_1.AppError('File not found', 404);
        }
        const thumbnails = {};
        for (const size of sizes) {
            const thumbFilename = `${fileId}_${size.name}${path_1.default.extname(file.filename)}`;
            const thumbPath = this.getUploadPath('thumbnails', thumbFilename);
            await this.processAndSaveImage(await fs_1.promises.readFile(file.path), thumbPath, {
                width: size.width,
                height: size.height,
                quality: 80,
            });
            thumbnails[size.name] = this.getFileUrl('thumbnails', thumbFilename);
        }
        // Update file record with thumbnail URLs
        await prisma.file.update({
            where: { id: fileId },
            data: { thumbnails },
        });
        return thumbnails;
    }
    /**
     * Delete a file
     */
    static async deleteFile(fileId, userId) {
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        if (!file) {
            throw new errors_1.AppError('File not found', 404);
        }
        if (file.userId !== userId) {
            throw new errors_1.AppError('Unauthorized to delete this file', 403);
        }
        // Delete physical file
        try {
            await fs_1.promises.unlink(file.path);
        }
        catch (error) {
            logger_1.logger.error('Failed to delete physical file', error);
        }
        // Delete thumbnails if any
        if (file.thumbnails) {
            for (const thumbUrl of Object.values(file.thumbnails)) {
                try {
                    const thumbPath = this.urlToPath(thumbUrl);
                    await fs_1.promises.unlink(thumbPath);
                }
                catch (error) {
                    logger_1.logger.error('Failed to delete thumbnail', error);
                }
            }
        }
        // Delete database record
        await prisma.file.delete({ where: { id: fileId } });
        logger_1.logger.info('File deleted successfully', { fileId, userId });
    }
    /**
     * Get file by ID
     */
    static async getFile(fileId) {
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        if (!file) {
            throw new errors_1.AppError('File not found', 404);
        }
        return file;
    }
    /**
     * Validate file
     */
    static validateFile(file, options) {
        // Check file size
        const maxSize = options.maxSize || this.MAX_FILE_SIZE;
        if (file.size > maxSize) {
            throw new errors_1.AppError(`File size exceeds maximum allowed size of ${maxSize} bytes`, 400);
        }
        // Check file type
        const allowedTypes = options.allowedTypes || [
            ...this.ALLOWED_IMAGE_TYPES,
            ...this.ALLOWED_DOCUMENT_TYPES,
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new errors_1.AppError(`File type ${file.mimetype} is not allowed`, 400);
        }
    }
    /**
     * Generate unique file ID
     */
    static generateFileId() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    /**
     * Get upload path for file
     */
    static getUploadPath(type, filename) {
        return path_1.default.join(this.UPLOAD_DIR, type, filename);
    }
    /**
     * Get public URL for file
     */
    static getFileUrl(type, filename) {
        return `${env_1.env.APP_URL}/uploads/${type}/${filename}`;
    }
    /**
     * Convert URL back to file path
     */
    static urlToPath(url) {
        const urlPath = new URL(url).pathname;
        const relativePath = urlPath.replace('/uploads/', '');
        return path_1.default.join(this.UPLOAD_DIR, relativePath);
    }
    /**
     * Clean up old temporary files
     */
    static async cleanupTempFiles(olderThanHours = 24) {
        const tempDir = path_1.default.join(this.UPLOAD_DIR, 'temp');
        const files = await fs_1.promises.readdir(tempDir);
        const now = Date.now();
        const maxAge = olderThanHours * 60 * 60 * 1000;
        for (const file of files) {
            const filePath = path_1.default.join(tempDir, file);
            const stats = await fs_1.promises.stat(filePath);
            if (now - stats.mtime.getTime() > maxAge) {
                await fs_1.promises.unlink(filePath);
                logger_1.logger.info('Deleted old temp file', { file });
            }
        }
    }
    /**
     * Get storage statistics
     */
    static async getStorageStats(userId) {
        const where = userId ? { userId } : {};
        const stats = await prisma.file.aggregate({
            where,
            _sum: { size: true },
            _count: true,
        });
        const byType = await prisma.file.groupBy({
            by: ['type'],
            where,
            _sum: { size: true },
            _count: true,
        });
        return {
            totalFiles: stats._count,
            totalSize: stats._sum.size || 0,
            byType: byType.map(t => ({
                type: t.type,
                count: t._count,
                size: t._sum.size || 0,
            })),
        };
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map