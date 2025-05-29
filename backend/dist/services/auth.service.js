"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class AuthService {
    static async register(data) {
        const { email, password, name, role } = data;
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errors_1.AppError('User already exists', 400);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Generate token
        const token = this.generateToken(user.id);
        logger_1.logger.info(`New user registered: ${user.email}`);
        return { user, token };
    }
    static async login(email, password) {
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errors_1.AppError('Invalid credentials', 401);
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errors_1.AppError('Invalid credentials', 401);
        }
        // Generate token
        const token = this.generateToken(user.id);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        logger_1.logger.info(`User logged in: ${user.email}`);
        return { user: userWithoutPassword, token };
    }
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config_1.config.jwtSecret);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            return user;
        }
        catch (error) {
            throw new errors_1.AppError('Invalid token', 401);
        }
    }
    static async refreshToken(oldToken) {
        const user = await this.verifyToken(oldToken);
        const token = this.generateToken(user.id);
        return { user, token };
    }
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.AppError('User not found', 404);
        }
        // Verify old password
        const isPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new errors_1.AppError('Invalid old password', 400);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        logger_1.logger.info(`Password changed for user: ${user.email}`);
    }
    static async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if user exists
            return;
        }
        // Generate reset token
        const resetToken = this.generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        // Save reset token
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        // TODO: Send reset email
        logger_1.logger.info(`Password reset requested for: ${user.email}`);
    }
    static async resetPassword(token, newPassword) {
        const user = await database_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new errors_1.AppError('Invalid or expired reset token', 400);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password and clear reset token
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        logger_1.logger.info(`Password reset for user: ${user.email}`);
    }
    static async verifyEmail(token) {
        const user = await database_1.prisma.user.findFirst({
            where: {
                emailVerifyToken: token,
            },
        });
        if (!user) {
            throw new errors_1.AppError('Invalid verification token', 400);
        }
        // Update email verification status
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyToken: null,
            },
        });
        logger_1.logger.info(`Email verified for user: ${user.email}`);
    }
    static generateToken(userId) {
        const secret = config_1.config.jwtSecret;
        const options = {
            expiresIn: config_1.config.jwtExpiresIn, // JWT accepts string like '7d'
        };
        return jwt.sign({ userId }, secret, options);
    }
    static generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    static async getUserById(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new errors_1.AppError('User not found', 404);
        }
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map