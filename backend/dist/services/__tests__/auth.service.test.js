"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../auth.service");
const setup_1 = require("../../tests/setup");
const factories_1 = require("../../tests/factories");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
describe('AuthService', () => {
    describe('register', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: client_1.UserRole.CUSTOMER,
            };
            const mockUser = (0, factories_1.createMockUser)({
                ...userData,
                password: await bcryptjs_1.default.hash(userData.password, 10),
            });
            setup_1.prismaMock.user.findUnique.mockResolvedValue(null);
            setup_1.prismaMock.user.create.mockResolvedValue(mockUser);
            const result = await auth_service_1.AuthService.register(userData);
            expect(result.user.email).toBe(userData.email);
            expect(result.token).toBeDefined();
            expect(setup_1.prismaMock.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                }),
                select: expect.any(Object),
            });
        });
        it('should throw error if user already exists', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'Existing User',
                role: client_1.UserRole.CUSTOMER,
            };
            setup_1.prismaMock.user.findUnique.mockResolvedValue((0, factories_1.createMockUser)({ email: userData.email }));
            await expect(auth_service_1.AuthService.register(userData)).rejects.toThrow('User already exists');
        });
    });
    describe('login', () => {
        it('should login user with correct credentials', async () => {
            const password = 'password123';
            const mockUser = (0, factories_1.createMockUser)({
                password: await bcryptjs_1.default.hash(password, 10),
            });
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            const result = await auth_service_1.AuthService.login(mockUser.email, password);
            expect(result.user.email).toBe(mockUser.email);
            expect(result.token).toBeDefined();
        });
        it('should throw error with invalid credentials', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            await expect(auth_service_1.AuthService.login(mockUser.email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
        });
        it('should throw error if user not found', async () => {
            setup_1.prismaMock.user.findUnique.mockResolvedValue(null);
            await expect(auth_service_1.AuthService.login('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials');
        });
    });
    describe('verifyToken', () => {
        it('should verify valid token', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            const token = jsonwebtoken_1.default.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            const result = await auth_service_1.AuthService.verifyToken(token);
            expect(result.id).toBe(mockUser.id);
            expect(result.email).toBe(mockUser.email);
        });
        it('should throw error for invalid token', async () => {
            await expect(auth_service_1.AuthService.verifyToken('invalid-token')).rejects.toThrow();
        });
    });
    describe('refreshToken', () => {
        it('should refresh token for valid user', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            const oldToken = jsonwebtoken_1.default.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            const result = await auth_service_1.AuthService.refreshToken(oldToken);
            expect(result.user.id).toBe(mockUser.id);
            expect(result.token).toBeDefined();
            expect(result.token).not.toBe(oldToken);
        });
    });
    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const oldPassword = 'oldpassword';
            const newPassword = 'newpassword';
            const mockUser = (0, factories_1.createMockUser)({
                password: await bcryptjs_1.default.hash(oldPassword, 10),
            });
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            setup_1.prismaMock.user.update.mockResolvedValue({
                ...mockUser,
                password: await bcryptjs_1.default.hash(newPassword, 10),
            });
            await auth_service_1.AuthService.changePassword(mockUser.id, oldPassword, newPassword);
            expect(setup_1.prismaMock.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { password: expect.any(String) },
            });
        });
        it('should throw error with incorrect old password', async () => {
            const mockUser = (0, factories_1.createMockUser)();
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            await expect(auth_service_1.AuthService.changePassword(mockUser.id, 'wrongpassword', 'newpassword')).rejects.toThrow('Invalid old password');
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map