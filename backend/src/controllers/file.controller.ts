import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class FileController {
  /**
   * Upload a single file
   */
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const { type = 'document', productId } = req.body;
      const userId = req.user!.id;

      const result = await FileService.uploadFile(req.file, {
        userId,
        productId,
        type,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const { type = 'document', productId } = req.body;
      const userId = req.user!.id;

      const results = await Promise.all(
        files.map(file =>
          FileService.uploadFile(file, {
            userId,
            productId,
            type,
          })
        )
      );

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload product images
   */
  static async uploadProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { productId } = req.params;
      const userId = req.user!.id;

      const results: any = {};

      // Handle thumbnail
      if (files.thumbnail && files.thumbnail[0]) {
        const thumbnail = await FileService.uploadFile(files.thumbnail[0], {
          userId,
          productId,
          type: 'product',
        });

        // Generate thumbnail sizes
        const thumbnails = await FileService.generateThumbnails(thumbnail.fileId, [
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
        results.screenshots = await Promise.all(
          files.screenshots.map(async file => {
            const uploaded = await FileService.uploadFile(file, {
              userId,
              productId,
              type: 'product',
            });

            // Generate screenshot thumbnails
            const thumbnails = await FileService.generateThumbnails(uploaded.fileId, [
              { name: 'preview', width: 400, height: 300 },
              { name: 'full', width: 1200, height: 900 },
            ]);

            return {
              ...uploaded,
              thumbnails,
            };
          })
        );
      }

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get file by ID
   */
  static async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const file = await FileService.getFile(fileId);

      res.json({
        success: true,
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;

      await FileService.deleteFile(fileId, userId);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's storage statistics
   */
  static async getStorageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await FileService.getStorageStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const userId = req.user!.id;

      const result = await FileService.uploadFile(req.file, {
        userId,
        type: 'avatar',
        maxSize: 5 * 1024 * 1024, // 5MB for avatars
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      // Generate avatar sizes
      const thumbnails = await FileService.generateThumbnails(result.fileId, [
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
    } catch (error) {
      next(error);
    }
  }
}