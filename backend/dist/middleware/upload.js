"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
// File filter function
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new errors_1.AppError(`File type ${file.mimetype} is not allowed`, 400));
    }
};
// Create multer instance with configuration
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB default
        files: 10, // Maximum 10 files per request
    },
});
// Middleware for single file upload
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 10) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
// Middleware for multiple fields
const uploadFields = (fields) => exports.upload.fields(fields);
exports.uploadFields = uploadFields;
// Example usage:
// router.post('/upload', uploadSingle('file'), controller.uploadFile);
// router.post('/upload-multiple', uploadMultiple('files', 5), controller.uploadFiles);
// router.post('/upload-product', uploadFields([
//   { name: 'thumbnail', maxCount: 1 },
//   { name: 'screenshots', maxCount: 10 },
//   { name: 'downloadFile', maxCount: 1 }
// ]), controller.uploadProduct);
//# sourceMappingURL=upload.js.map