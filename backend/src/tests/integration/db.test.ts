import { prisma } from '../../config/database';

describe('Database Connection Test', () => {
  it('should connect to database', async () => {
    console.log('Prisma client:', prisma);
    console.log('Prisma user model:', prisma.user);
    
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
});