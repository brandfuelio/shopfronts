"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_controller_1 = require("../controllers/file.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All file routes require authentication
router.use(auth_1.authenticate);
// Upload single file
router.post('/upload', (0, upload_1.uploadSingle)('file'), [
    (0, express_validator_1.body)('type').optional().isIn(['product', 'avatar', 'document']),
    (0, express_validator_1.body)('productId').optional().isString(),
], validation_1.validateRequest, file_controller_1.FileController.uploadFile);
// Upload multiple files
router.post('/upload-multiple', (0, upload_1.uploadMultiple)('files', 10), [
    (0, express_validator_1.body)('type').optional().isIn(['product', 'avatar', 'document']),
    (0, express_validator_1.body)('productId').optional().isString(),
], validation_1.validateRequest, file_controller_1.FileController.uploadMultipleFiles);
// Upload product images
router.post('/products/:productId/images', (0, upload_1.uploadFields)([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 },
]), [(0, express_validator_1.param)('productId').isString()], validation_1.validateRequest, file_controller_1.FileController.uploadProductImages);
// Upload user avatar
router.post('/avatar', (0, upload_1.uploadSingle)('avatar'), file_controller_1.FileController.uploadAvatar);
// Get file by ID
router.get('/:fileId', [(0, express_validator_1.param)('fileId').isString()], validation_1.validateRequest, file_controller_1.FileController.getFile);
// Delete file
router.delete('/:fileId', [(0, express_validator_1.param)('fileId').isString()], validation_1.validateRequest, file_controller_1.FileController.deleteFile);
// Get storage statistics
router.get('/stats/storage', file_controller_1.FileController.getStorageStats);
exports.default = router;
//# sourceMappingURL=file.routes.js.map