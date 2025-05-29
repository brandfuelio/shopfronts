"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const file_service_1 = require("../services/file.service");
const errors_1 = require("../utils/errors");
class FileController {
    /**
     * Upload a single file
     */
    static async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.AppError('No file uploaded', 400);
            }
            const { type = 'document', productId } = req.body;
            const userId = req.user.id;
            const result = await file_service_1.FileService.uploadFile(req.file, {
                userId,
                productId,
                type,
            });
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Upload multiple files
     */
    static async uploadMultipleFiles(req, res, next) {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                throw new errors_1.AppError('No files uploaded', 400);
            }
            const { type = 'document', productId } = req.body;
            const userId = req.user.id;
            const results = await Promise.all(files.map(file => file_service_1.FileService.uploadFile(file, {
                userId,
                productId,
                type,
            })));
            res.status(201).json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Upload product images
     */
    static async uploadProductImages(req, res, next) {
        try {
            const files = req.files;
            const { productId } = req.params;
            const userId = req.user.id;
            const results = {};
            // Handle thumbnail
            if (files.thumbnail && files.thumbnail[0]) {
                const thumbnail = await file_service_1.FileService.uploadFile(files.thumbnail[0], {
                    userId,
                    productId,
                    type: 'product',
                });
                // Generate thumbnail sizes
                const thumbnails = await file_service_1.FileService.generateThumbnails(thumbnail.fileId, [
                    { name: 'small', width: 150, height: 150 },
                    { name: 'medium', width: 300, height: 300 },
                    { name: 'large', width: 600, height: 600 },
                ]);
                results.thumbnail = {
                    ...thumbnail,
                    thumbnails,
                };
            }
            // Handle screenshots
            if (files.screenshots) {
                results.screenshots = await Promise.all(files.screenshots.map(async (file) => {
                    const uploaded = await file_service_1.FileService.uploadFile(file, {
                        userId,
                        productId,
                        type: 'product',
                    });
                    // Generate screenshot thumbnails
                    const thumbnails = await file_service_1.FileService.generateThumbnails(uploaded.fileId, [
                        { name: 'preview', width: 400, height: 300 },
                        { name: 'full', width: 1200, height: 900 },
                    ]);
                    return {
                        ...uploaded,
                        thumbnails,
                    };
                }));
            }
            res.status(201).json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get file by ID
     */
    static async getFile(req, res, next) {
        try {
            const { fileId } = req.params;
            const file = await file_service_1.FileService.getFile(fileId);
            res.json({
                success: true,
                data: file,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete file
     */
    static async deleteFile(req, res, next) {
        try {
            const { fileId } = req.params;
            const userId = req.user.id;
            await file_service_1.FileService.deleteFile(fileId, userId);
            res.json({
                success: true,
                message: 'File deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user's storage statistics
     */
    static async getStorageStats(req, res, next) {
        try {
            const userId = req.user.id;
            const stats = await file_service_1.FileService.getStorageStats(userId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Upload user avatar
     */
    static async uploadAvatar(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.AppError('No file uploaded', 400);
            }
            const userId = req.user.id;
            const result = await file_service_1.FileService.uploadFile(req.file, {
                userId,
                type: 'avatar',
                maxSize: 5 * 1024 * 1024, // 5MB for avatars
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
            // Generate avatar sizes
            const thumbnails = await file_service_1.FileService.generateThumbnails(result.fileId, [
                { name: 'small', width: 50, height: 50 },
                { name: 'medium', width: 100, height: 100 },
                { name: 'large', width: 200, height: 200 },
            ]);
            res.status(201).json({
                success: true,
                data: {
                    ...result,
                    thumbnails,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FileController = FileController;
//# sourceMappingURL=file.controller.js.map