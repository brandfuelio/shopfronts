import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple, uploadFields } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All file routes require authentication
router.use(authenticate);

// Upload single file
router.post(
  '/upload',
  uploadSingle('file'),
  [
    body('type').optional().isIn(['product', 'avatar', 'document']),
    body('productId').optional().isString(),
  ],
  validateRequest,
  FileController.uploadFile
);

// Upload multiple files
router.post(
  '/upload-multiple',
  uploadMultiple('files', 10),
  [
    body('type').optional().isIn(['product', 'avatar', 'document']),
    body('productId').optional().isString(),
  ],
  validateRequest,
  FileController.uploadMultipleFiles
);

// Upload product images
router.post(
  '/products/:productId/images',
  uploadFields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 },
  ]),
  [param('productId').isString()],
  validateRequest,
  FileController.uploadProductImages
);

// Upload user avatar
router.post(
  '/avatar',
  uploadSingle('avatar'),
  FileController.uploadAvatar
);

// Get file by ID
router.get(
  '/:fileId',
  [param('fileId').isString()],
  validateRequest,
  FileController.getFile
);

// Delete file
router.delete(
  '/:fileId',
  [param('fileId').isString()],
  validateRequest,
  FileController.deleteFile
);

// Get storage statistics
router.get('/stats/storage', FileController.getStorageStats);

export default router;