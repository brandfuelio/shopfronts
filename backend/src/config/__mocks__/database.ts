import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Create the mock
const prismaMock = mockDeep<PrismaClient>();

export const prisma = prismaMock as unknown as PrismaClient & DeepMockProxy<PrismaClient>;

export const connectDatabase = jest.fn();
export const disconnectDatabase = jest.fn();

export default prisma;