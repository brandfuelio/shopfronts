"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockUsers = exports.createMockUser = void 0;
const faker_1 = require("@faker-js/faker");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createMockUser = (overrides) => {
    return {
        id: faker_1.faker.string.uuid(),
        email: faker_1.faker.internet.email(),
        password: bcryptjs_1.default.hashSync('password123', 10),
        name: faker_1.faker.person.fullName(),
        role: client_1.UserRole.CUSTOMER,
        emailVerified: true,
        emailVerifyToken: null,
        resetToken: null,
        resetTokenExpiry: null,
        stripeCustomerId: null,
        notificationPreferences: {},
        avatar: faker_1.faker.image.avatar(),
        isActive: true,
        lastLogin: null,
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides,
    };
};
exports.createMockUser = createMockUser;
const createMockUsers = (count, overrides) => {
    return Array.from({ length: count }, () => (0, exports.createMockUser)(overrides));
};
exports.createMockUsers = createMockUsers;
//# sourceMappingURL=user.factory.js.map