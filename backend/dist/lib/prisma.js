"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Re-export prisma from config/database
var database_1 = require("../config/database");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return database_1.prisma; } });
//# sourceMappingURL=prisma.js.map