import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Create the mock
const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

// Export as default and named export to match the real database module
export default prisma;
export { prisma };