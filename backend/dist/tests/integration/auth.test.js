"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Mock the database module
jest.mock('../../config/database');
// Mock bcrypt to speed up tests
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(password === 'password123')),
}));
// Then import other modules
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const factories_1 = require("../factories");
const auth_routes_1 = __importDefault(require("../../routes/auth.routes"));
const errorHandler_1 = require("../../middleware/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
// Type the mock properly
const typedPrismaMock = database_1.prisma;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('Auth API Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
                role: client_1.UserRole.CUSTOMER,
            };
            console.log('typedPrismaMock:', typedPrismaMock);
            console.log('typedPrismaMock.user:', typedPrismaMock.user);
            typedPrismaMock.user.findUnique.mockResolvedValue(null);
            typedPrismaMock.user.create.mockResolvedValue((0, factories_1.createMockUser)({
                ...userData,
                password: await bcryptjs_1.default.hash(userData.password, 10),
            }));
            typedPrismaMock.refreshToken.create.mockResolvedValue({
                id: 'refresh-token-id',
                token: 'refresh-token',
                userId: 'user-id',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
            });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            if (response.status !== 201) {
                console.error('Register error:', response.body);
            }
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.token).toBeDefined();
        });
        it('should return 400 for invalid email', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                email: 'invalid-email',
                password: 'password123',
                name: 'Test User',
                role: client_1.UserRole.CUSTOMER,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
        it('should return 400 for existing user', async () => {
            const existingUser = (0, factories_1.createMockUser)();
            typedPrismaMock.user.findUnique.mockResolvedValue(existingUser);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                email: existingUser.email,
                password: 'password123',
                name: 'Test User',
                role: client_1.UserRole.CUSTOMER,
            })
                .expect(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const password = 'password123';
            const mockUser = (0, factories_1.createMockUser)({
                password: await bcryptjs_1.default.hash(password, 10),
            });
            typedPrismaMock.user.findUnique.mockResolvedValue(mockUser);
            typedPrismaMock.refreshToken.create.mockResolvedValue({
                id: 'refresh-token-id',
                token: 'refresh-token',
                userId: mockUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
            });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: mockUser.email,
                password: password,
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(mockUser.email);
            expect(response.body.data.token).toBeDefined();
        });
        it('should return 401 for invalid credentials', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            typedPrismaMock.user.findUnique.mockResolvedValue(mockUser);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: mockUser.email,
                password: 'wrongpassword',
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            const token = jsonwebtoken_1.default.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
            typedPrismaMock.user.findUnique.mockResolvedValue(mockUser);
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(mockUser.id);
            expect(response.body.data.email).toBe(mockUser.email);
        });
        it('should return 401 without token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/refresh', () => {
        it('should refresh token', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            const refreshToken = 'valid-refresh-token';
            typedPrismaMock.refreshToken.findUnique.mockResolvedValue({
                id: 'token-id',
                token: refreshToken,
                userId: mockUser.id,
                user: mockUser,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
            });
            typedPrismaMock.refreshToken.delete.mockResolvedValue({
                id: 'token-id',
                token: refreshToken,
                userId: mockUser.id,
                expiresAt: new Date(),
                createdAt: new Date(),
            });
            typedPrismaMock.refreshToken.create.mockResolvedValue({
                id: 'new-token-id',
                token: 'new-refresh-token',
                userId: mockUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
            });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .set('Cookie', `refreshToken=${refreshToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });
    });
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            const token = jsonwebtoken_1.default.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
            typedPrismaMock.user.findUnique.mockResolvedValue(mockUser);
            typedPrismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .set('Cookie', 'refreshToken=some-refresh-token')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Logged out');
        });
    });
});
//# sourceMappingURL=auth.test.js.map