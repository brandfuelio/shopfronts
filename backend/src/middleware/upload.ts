import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Define allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    // Videos (for product demos)
    'video/mp4',
    'video/webm',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed`, 400));
  }
};

// Create multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB default
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

// Middleware for multiple fields
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// Example usage:
// router.post('/upload', uploadSingle('file'), controller.uploadFile);
// router.post('/upload-multiple', uploadMultiple('files', 5), controller.uploadFiles);
// router.post('/upload-product', uploadFields([
//   { name: 'thumbnail', maxCount: 1 },
//   { name: 'screenshots', maxCount: 10 },
//   { name: 'downloadFile', maxCount: 1 }
// ]), controller.uploadProduct);