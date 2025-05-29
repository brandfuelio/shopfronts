"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
// Create the mock
const prismaMock = (0, jest_mock_extended_1.mockDeep)();
exports.prisma = prismaMock;
exports.connectDatabase = jest.fn();
exports.disconnectDatabase = jest.fn();
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map