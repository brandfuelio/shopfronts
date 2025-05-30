"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
describe('Database Connection Test', () => {
    it('should connect to database', async () => {
        console.log('Prisma client:', database_1.prisma);
        console.log('Prisma user model:', database_1.prisma.user);
        const users = await database_1.prisma.user.findMany();
        expect(Array.isArray(users)).toBe(true);
    });
    afterAll(async () => {
        await database_1.prisma.$disconnect();
    });
});
//# sourceMappingURL=db.test.js.map