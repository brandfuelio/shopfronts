"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("../../routes/auth.routes"));
const errorHandler_1 = require("../../middleware/errorHandler");
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_routes_1.default);
app.use(errorHandler_1.errorHandler);
// Connect to database before all tests
beforeAll(async () => {
    await database_1.prisma.$connect();
});
// Clean up database before each test
beforeEach(async () => {
    await database_1.prisma.refreshToken.deleteMany();
    await database_1.prisma.user.deleteMany();
});
// Clean up after all tests
afterAll(async () => {
    await database_1.prisma.$disconnect();
});
describe('Auth API Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: client_1.UserRole.CUSTOMER,
            };
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
            expect(response.headers['set-cookie']).toBeDefined();
            // Verify user was created in database
            const user = await database_1.prisma.user.findUnique({
                where: { email: userData.email }
            });
            expect(user).toBeDefined();
            expect(user?.email).toBe(userData.email);
        });
        it('should return 400 for invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                name: 'Test User',
                role: client_1.UserRole.CUSTOMER,
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 for existing user', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'Existing User',
                role: client_1.UserRole.CUSTOMER,
            };
            // Create user first
            await database_1.prisma.user.create({
                data: userData
            });
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('already exists');
        });
    });
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            // First register a user
            const userData = {
                email: 'login@example.com',
                password: 'password123',
                name: 'Login User',
                role: client_1.UserRole.CUSTOMER,
            };
            await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: userData.email,
                password: userData.password,
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.token).toBeDefined();
            expect(response.headers['set-cookie']).toBeDefined();
        });
        it('should return 401 for invalid credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            // Register and login
            const userData = {
                email: 'me@example.com',
                password: 'password123',
                name: 'Me User',
                role: client_1.UserRole.CUSTOMER,
            };
            const registerResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            const token = registerResponse.body.data.token;
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(userData.email);
        });
        it('should return 401 without token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/me');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/refresh', () => {
        it('should refresh token', async () => {
            // Register and login
            const userData = {
                email: 'refresh@example.com',
                password: 'password123',
                name: 'Refresh User',
                role: client_1.UserRole.CUSTOMER,
            };
            const registerResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            // Extract refresh token from cookies
            const cookies = registerResponse.headers['set-cookie'];
            const refreshTokenCookie = Array.isArray(cookies)
                ? cookies.find((cookie) => cookie.startsWith('refreshToken='))
                : cookies?.startsWith('refreshToken=') ? cookies : undefined;
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/refresh')
                .set('Cookie', refreshTokenCookie || '');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.headers['set-cookie']).toBeDefined();
        });
    });
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            // Register and login
            const userData = {
                email: 'logout@example.com',
                password: 'password123',
                name: 'Logout User',
                role: client_1.UserRole.CUSTOMER,
            };
            const registerResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            const token = registerResponse.body.data.token;
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            // Verify refresh token cookie is cleared
            const cookies = response.headers['set-cookie'];
            const refreshTokenCookie = Array.isArray(cookies)
                ? cookies.find((cookie) => cookie.startsWith('refreshToken='))
                : cookies?.startsWith('refreshToken=') ? cookies : undefined;
            expect(refreshTokenCookie).toContain('Max-Age=0');
        });
    });
});
//# sourceMappingURL=auth.integration.test.js.map