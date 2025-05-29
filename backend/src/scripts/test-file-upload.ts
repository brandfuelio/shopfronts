import fs from 'fs';
import path from 'path';
import { FileService } from '../services/file.service';
import { logger } from '../utils/logger';

async function testFileUpload() {
  try {
    logger.info('Testing file upload service...');

    // Create a test file
    const testContent = Buffer.from('This is a test file for upload testing');
    const testFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: testContent,
      size: testContent.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    // Test 1: Upload a document
    logger.info('Test 1: Uploading document...');
    const uploadResult = await FileService.uploadFile(testFile, {
      userId: 'test-user-123',
      type: 'document',
    });
    logger.info('Document uploaded:', uploadResult);

    // Test 2: Upload an image and generate thumbnails
    logger.info('\nTest 2: Uploading image with thumbnails...');
    const imageContent = Buffer.from('Fake image content');
    const imageFile: Express.Multer.File = {
      ...testFile,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      buffer: imageContent,
      size: imageContent.length,
    };

    const imageResult = await FileService.uploadFile(imageFile, {
      userId: 'test-user-123',
      type: 'product',
      productId: 'test-product-123',
    });
    logger.info('Image uploaded:', imageResult);

    // Note: Thumbnail generation will fail with fake image content
    // In real usage, it would work with actual image data

    // Test 3: Get file info
    logger.info('\nTest 3: Getting file info...');
    const fileInfo = await FileService.getFile(uploadResult.fileId);
    logger.info('File info:', fileInfo);

    // Test 4: Get storage stats
    logger.info('\nTest 4: Getting storage stats...');
    const stats = await FileService.getStorageStats('test-user-123');
    logger.info('Storage stats:', stats);

    // Test 5: Delete file
    logger.info('\nTest 5: Deleting file...');
    await FileService.deleteFile(uploadResult.fileId, 'test-user-123');
    logger.info('File deleted successfully');

    logger.info('\nAll file upload tests completed successfully!');
  } catch (error) {
    logger.error('File upload test failed:', error);
  }
}

// Run the test
testFileUpload();