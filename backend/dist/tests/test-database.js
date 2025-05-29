"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
// Create the mock
const prisma = (0, jest_mock_extended_1.mockDeep)();
exports.prisma = prisma;
// Export as default and named export to match the real database module
exports.default = prisma;
//# sourceMappingURL=test-database.js.map