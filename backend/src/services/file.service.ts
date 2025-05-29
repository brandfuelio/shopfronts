import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface FileUploadOptions {
  userId: string;
  productId?: string;
  type: 'product' | 'avatar' | 'document';
  maxSize?: number;
  allowedTypes?: string[];
}

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class FileService {
  private static readonly UPLOAD_DIR = env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  private static readonly MAX_FILE_SIZE = env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/zip'];

  /**
   * Initialize upload directories
   */
  static async initialize(): Promise<void> {
    const dirs = ['products', 'avatars', 'documents', 'temp'].map(dir =>
      path.join(this.UPLOAD_DIR, dir)
    );

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    logger.info('File upload directories initialized');
  }

  /**
   * Upload a file
   */
  static async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<{ fileId: string; url: string; metadata: any }> {
    try {
      // Validate file
      this.validateFile(file, options);

      // Generate unique filename
      const fileId = this.generateFileId();
      const ext = path.extname(file.originalname);
      const filename = `${fileId}${ext}`;

      // Determine upload path
      const uploadPath = this.getUploadPath(options.type, filename);

      // Process image if applicable
      if (this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        await this.processAndSaveImage(file.buffer, uploadPath);
      } else {
        await fs.writeFile(uploadPath, file.buffer);
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

      logger.info('File uploaded successfully', { fileId, userId: options.userId });

      return {
        fileId: fileRecord.id,
        url: fileRecord.url,
        metadata: {
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
        },
      };
    } catch (error) {
      logger.error('File upload failed', error);
      throw error;
    }
  }

  /**
   * Process and save image with optimization
   */
  private static async processAndSaveImage(
    buffer: Buffer,
    outputPath: string,
    options?: ImageProcessingOptions
  ): Promise<void> {
    const image = sharp(buffer);

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
  static async generateThumbnails(
    fileId: string,
    sizes: Array<{ name: string; width: number; height: number }>
  ): Promise<Record<string, string>> {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new AppError('File not found', 404);
    }

    const thumbnails: Record<string, string> = {};

    for (const size of sizes) {
      const thumbFilename = `${fileId}_${size.name}${path.extname(file.filename)}`;
      const thumbPath = this.getUploadPath('thumbnails', thumbFilename);

      await this.processAndSaveImage(
        await fs.readFile(file.path),
        thumbPath,
        {
          width: size.width,
          height: size.height,
          quality: 80,
        }
      );

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
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    if (file.userId !== userId) {
      throw new AppError('Unauthorized to delete this file', 403);
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.error('Failed to delete physical file', error);
    }

    // Delete thumbnails if any
    if (file.thumbnails) {
      for (const thumbUrl of Object.values(file.thumbnails as Record<string, string>)) {
        try {
          const thumbPath = this.urlToPath(thumbUrl);
          await fs.unlink(thumbPath);
        } catch (error) {
          logger.error('Failed to delete thumbnail', error);
        }
      }
    }

    // Delete database record
    await prisma.file.delete({ where: { id: fileId } });

    logger.info('File deleted successfully', { fileId, userId });
  }

  /**
   * Get file by ID
   */
  static async getFile(fileId: string): Promise<any> {
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    return file;
  }

  /**
   * Validate file
   */
  private static validateFile(file: Express.Multer.File, options: FileUploadOptions): void {
    // Check file size
    const maxSize = options.maxSize || this.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new AppError(`File size exceeds maximum allowed size of ${maxSize} bytes`, 400);
    }

    // Check file type
    const allowedTypes = options.allowedTypes || [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(`File type ${file.mimetype} is not allowed`, 400);
    }
  }

  /**
   * Generate unique file ID
   */
  private static generateFileId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get upload path for file
   */
  private static getUploadPath(type: string, filename: string): string {
    return path.join(this.UPLOAD_DIR, type, filename);
  }

  /**
   * Get public URL for file
   */
  private static getFileUrl(type: string, filename: string): string {
    return `${env.APP_URL}/uploads/${type}/${filename}`;
  }

  /**
   * Convert URL back to file path
   */
  private static urlToPath(url: string): string {
    const urlPath = new URL(url).pathname;
    const relativePath = urlPath.replace('/uploads/', '');
    return path.join(this.UPLOAD_DIR, relativePath);
  }

  /**
   * Clean up old temporary files
   */
  static async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    const tempDir = path.join(this.UPLOAD_DIR, 'temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = olderThanHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        logger.info('Deleted old temp file', { file });
      }
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(userId?: string): Promise<any> {
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