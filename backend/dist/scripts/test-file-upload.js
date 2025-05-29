"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_service_1 = require("../services/file.service");
const logger_1 = require("../utils/logger");
async function testFileUpload() {
    try {
        logger_1.logger.info('Testing file upload service...');
        // Create a test file
        const testContent = Buffer.from('This is a test file for upload testing');
        const testFile = {
            fieldname: 'file',
            originalname: 'test-document.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            buffer: testContent,
            size: testContent.length,
            stream: null,
            destination: '',
            filename: '',
            path: '',
        };
        // Test 1: Upload a document
        logger_1.logger.info('Test 1: Uploading document...');
        const uploadResult = await file_service_1.FileService.uploadFile(testFile, {
            userId: 'test-user-123',
            type: 'document',
        });
        logger_1.logger.info('Document uploaded:', uploadResult);
        // Test 2: Upload an image and generate thumbnails
        logger_1.logger.info('\nTest 2: Uploading image with thumbnails...');
        const imageContent = Buffer.from('Fake image content');
        const imageFile = {
            ...testFile,
            originalname: 'test-image.jpg',
            mimetype: 'image/jpeg',
            buffer: imageContent,
            size: imageContent.length,
        };
        const imageResult = await file_service_1.FileService.uploadFile(imageFile, {
            userId: 'test-user-123',
            type: 'product',
            productId: 'test-product-123',
        });
        logger_1.logger.info('Image uploaded:', imageResult);
        // Note: Thumbnail generation will fail with fake image content
        // In real usage, it would work with actual image data
        // Test 3: Get file info
        logger_1.logger.info('\nTest 3: Getting file info...');
        const fileInfo = await file_service_1.FileService.getFile(uploadResult.fileId);
        logger_1.logger.info('File info:', fileInfo);
        // Test 4: Get storage stats
        logger_1.logger.info('\nTest 4: Getting storage stats...');
        const stats = await file_service_1.FileService.getStorageStats('test-user-123');
        logger_1.logger.info('Storage stats:', stats);
        // Test 5: Delete file
        logger_1.logger.info('\nTest 5: Deleting file...');
        await file_service_1.FileService.deleteFile(uploadResult.fileId, 'test-user-123');
        logger_1.logger.info('File deleted successfully');
        logger_1.logger.info('\nAll file upload tests completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('File upload test failed:', error);
    }
}
// Run the test
testFileUpload();
//# sourceMappingURL=test-file-upload.js.map