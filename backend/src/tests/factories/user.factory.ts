import { faker } from '@faker-js/faker';
import { User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: bcrypt.hashSync('password123', 10),
    name: faker.person.fullName(),
    role: UserRole.CUSTOMER,
    emailVerified: true,
    emailVerifyToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    stripeCustomerId: null,
    notificationPreferences: {},
    avatar: faker.image.avatar(),
    isActive: true,
    lastLogin: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
};

export const createMockUsers = (count: number, overrides?: Partial<User>): User[] => {
  return Array.from({ length: count }, () => createMockUser(overrides));
};