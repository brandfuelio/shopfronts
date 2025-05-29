import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/errors';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface LoginResponse {
  user: any;
  token: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<LoginResponse> {
    const { email, password, name, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
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

    logger.info(`New user registered: ${user.email}`);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    return { user: userWithoutPassword, token };
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      
      const user = await prisma.user.findUnique({
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
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  static async refreshToken(oldToken: string): Promise<LoginResponse> {
    const user = await this.verifyToken(oldToken);
    const token = this.generateToken(user.id);
    
    return { user, token };
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid old password', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send reset email
    logger.info(`Password reset requested for: ${user.email}`);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    logger.info(`Password reset for user: ${user.email}`);
  }

  static async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    // Update email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    logger.info(`Email verified for user: ${user.email}`);
  }

  private static generateToken(userId: string): string {
    const secret = config.jwtSecret;
    const options: jwt.SignOptions = {
      expiresIn: config.jwtExpiresIn as any, // JWT accepts string like '7d'
    };
    return jwt.sign({ userId }, secret, options);
  }

  private static generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw new AppError('User not found', 404);
    }

    return user;
  }
}