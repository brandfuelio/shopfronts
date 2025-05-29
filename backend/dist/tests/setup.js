"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
// Mock Prisma Client
exports.prismaMock = (0, jest_mock_extended_1.mockDeep)();
jest.mock('../config/database', () => ({
    prisma: exports.prismaMock,
}));
// Mock Redis
jest.mock('ioredis', () => {
    const Redis = jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
        info: jest.fn(),
        flushdb: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
    }));
    return Redis;
});
// Mock logger
jest.mock('../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));
// Reset mocks before each test
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
    jest.clearAllMocks();
});
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
//# sourceMappingURL=setup.js.map