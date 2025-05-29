"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const register = async (req, res, next) => {
    try {
        const { email, password, name, role = 'CUSTOMER' } = req.body;
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('Email already registered', 400);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                emailVerifyToken: crypto_1.default.randomBytes(32).toString('hex')
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true
            }
        });
        // Generate tokens
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user);
        // Save refresh token
        await database_1.default.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });
        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        logger_1.logger.info(`New user registered: ${user.email}`);
        res.status(201).json({
            success: true,
            data: {
                user,
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
                isActive: true,
                emailVerified: true
            }
        });
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Check password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Update last login
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // Generate tokens
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user);
        // Save refresh token
        await database_1.default.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        logger_1.logger.info(`User logged in: ${user.email}`);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified
                },
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new errorHandler_1.AppError('Refresh token not provided', 401);
        }
        // Verify refresh token
        (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Check if token exists in database
        const storedToken = await database_1.default.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new errorHandler_1.AppError('Invalid refresh token', 401);
        }
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateTokens)(storedToken.user);
        // Delete old refresh token
        await database_1.default.refreshToken.delete({
            where: { id: storedToken.id }
        });
        // Save new refresh token
        await database_1.default.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: storedToken.user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        // Set new cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            success: true,
            data: {
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            // Delete refresh token from database
            await database_1.default.refreshToken.deleteMany({
                where: { token: refreshToken }
            });
        }
        // Clear cookie
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if user exists
            res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        // Save reset token
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
        });
        // TODO: Send email with reset link
        logger_1.logger.info(`Password reset requested for: ${user.email}`);
        res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        // Hash the token
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with valid reset token
        const user = await database_1.default.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid or expired reset token', 400);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Update user
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        logger_1.logger.info(`Password reset completed for: ${user.email}`);
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map