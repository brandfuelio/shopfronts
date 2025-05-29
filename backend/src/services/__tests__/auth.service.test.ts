import { AuthService } from '../auth.service';
import { prismaMock } from '../../tests/setup';
import { createMockUser } from '../../tests/factories';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.CUSTOMER,
      };

      const mockUser = createMockUser({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
      });

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await AuthService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBeDefined();
      expect(prismaMock.user.create).toHaveBeenCalledWith({
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
        role: UserRole.CUSTOMER,
      };

      prismaMock.user.findUnique.mockResolvedValue(createMockUser({ email: userData.email }));

      await expect(AuthService.register(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const password = 'password123';
      const mockUser = createMockUser({
        password: await bcrypt.hash(password, 10),
      });

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.login(mockUser.email, password);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.token).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const mockUser = createMockUser();
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(AuthService.login(mockUser.email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(AuthService.login('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockUser = createMockUser();
      const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET!);

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.verifyToken(token);

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', async () => {
      await expect(AuthService.verifyToken('invalid-token')).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token for valid user', async () => {
      const mockUser = createMockUser();
      const oldToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET!);

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.refreshToken(oldToken);

      expect(result.user.id).toBe(mockUser.id);
      expect(result.token).toBeDefined();
      expect(result.token).not.toBe(oldToken);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const mockUser = createMockUser({
        password: await bcrypt.hash(oldPassword, 10),
      });

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash(newPassword, 10),
      });

      await AuthService.changePassword(mockUser.id, oldPassword, newPassword);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: expect.any(String) },
      });
    });

    it('should throw error with incorrect old password', async () => {
      const mockUser = createMockUser();
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        AuthService.changePassword(mockUser.id, 'wrongpassword', 'newpassword')
      ).rejects.toThrow('Invalid old password');
    });
  });
});