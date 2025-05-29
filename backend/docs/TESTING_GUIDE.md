# Testing Guide

## Overview

This guide covers the testing strategy, tools, and best practices for the ShopFronts API.

## Testing Stack

- **Jest**: Testing framework
- **Supertest**: HTTP assertions
- **ts-jest**: TypeScript support
- **Prisma**: Database mocking
- **Redis Mock**: Redis testing
- **Faker**: Test data generation

## Test Structure

```
src/
├── tests/
│   ├── setup.ts              # Global test setup
│   ├── factories/            # Test data factories
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── utils/                # Test utilities
├── services/
│   └── __tests__/            # Unit tests for services
├── controllers/
│   └── __tests__/            # Unit tests for controllers
└── utils/
    └── __tests__/            # Unit tests for utilities
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Writing Tests

### Unit Tests

#### Service Test Example
```typescript
// src/services/__tests__/product.service.test.ts
import { prismaMock } from '../../tests/setup';
import { ProductService } from '../product.service';
import { createMockProduct } from '../../tests/factories';

describe('ProductService', () => {
  describe('findById', () => {
    it('should return product when found', async () => {
      const mockProduct = createMockProduct();
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const result = await ProductService.findById(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        include: expect.any(Object),
      });
    });

    it('should throw error when product not found', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(ProductService.findById('non-existent')).rejects.toThrow('Product not found');
    });
  });
});
```

#### Controller Test Example
```typescript
// src/controllers/__tests__/auth.controller.test.ts
import { Request, Response } from 'express';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../services/auth.service';

jest.mock('../../services/auth.service');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockToken = 'jwt-token';

      (AuthService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      req.body = { email: 'test@example.com', password: 'password' };

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
    });
  });
});
```

### Integration Tests

```typescript
// src/tests/integration/product.test.ts
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../setup';
import { createMockProduct, createMockUser } from '../factories';
import { generateToken } from '../../utils/jwt';

describe('Product API', () => {
  let authToken: string;

  beforeAll(() => {
    const mockUser = createMockUser();
    authToken = generateToken(mockUser);
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        createMockProduct(),
        createMockProduct(),
      ];

      prismaMock.product.findMany.mockResolvedValue(mockProducts);
      prismaMock.product.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          products: expect.arrayContaining([
            expect.objectContaining({ id: mockProducts[0].id }),
            expect.objectContaining({ id: mockProducts[1].id }),
          ]),
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
          },
        },
      });
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create product for authenticated seller', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        categoryId: 'category-id',
      };

      const mockProduct = createMockProduct(productData);
      prismaMock.product.create.mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          name: productData.name,
          price: productData.price,
        }),
      });
    });
  });
});
```

### E2E Tests

```typescript
// src/tests/e2e/purchase-flow.test.ts
import request from 'supertest';
import app from '../../app';
import { setupTestDatabase, teardownTestDatabase } from '../utils/database';

describe('E2E: Purchase Flow', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should complete full purchase flow', async () => {
    // 1. Register user
    const { body: registerResponse } = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'buyer@example.com',
        password: 'password123',
        name: 'Test Buyer',
        role: 'BUYER',
      })
      .expect(201);

    const authToken = registerResponse.data.token;

    // 2. Browse products
    const { body: productsResponse } = await request(app)
      .get('/api/v1/products')
      .expect(200);

    const productId = productsResponse.data.products[0].id;

    // 3. Add to cart
    await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId, quantity: 1 })
      .expect(200);

    // 4. Create order
    const { body: orderResponse } = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country',
        },
      })
      .expect(201);

    expect(orderResponse.data).toHaveProperty('id');
    expect(orderResponse.data.status).toBe('PENDING');
  });
});
```

## Test Data Factories

### User Factory
```typescript
// src/tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User, UserRole } from '@prisma/client';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.person.fullName(),
  role: UserRole.BUYER,
  avatar: faker.image.avatar(),
  bio: faker.lorem.paragraph(),
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

### Product Factory
```typescript
// src/tests/factories/product.factory.ts
import { faker } from '@faker-js/faker';
import { Product } from '@prisma/client';

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price()),
  images: [faker.image.url()],
  stock: faker.number.int({ min: 0, max: 100 }),
  categoryId: faker.string.uuid(),
  sellerId: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

## Mocking Strategies

### Database Mocking
```typescript
// Using singleton pattern for Prisma mock
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
```

### External Service Mocking
```typescript
// Mocking AI service
jest.mock('../src/services/ai.service', () => ({
  AIService: {
    generateResponse: jest.fn().mockResolvedValue({
      content: 'Mocked AI response',
      suggestions: ['Product 1', 'Product 2'],
    }),
  },
}));

// Mocking email service
jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  },
}));
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Isolation
- Reset mocks between tests
- Use `beforeEach` and `afterEach` hooks
- Avoid test interdependencies

### 3. Test Data
- Use factories for consistent test data
- Avoid hardcoded values
- Generate realistic data with Faker

### 4. Assertions
- Test both success and error cases
- Verify function calls and parameters
- Check response structure and data

### 5. Performance
- Mock external dependencies
- Use test databases for integration tests
- Parallelize test execution

## Coverage Goals

- **Overall**: 80% minimum
- **Critical paths**: 95% minimum
- **New code**: 90% minimum

### Coverage Reports
```bash
npm run test:coverage
```

View detailed report:
```bash
open coverage/lcov-report/index.html
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

## Debugging Tests

### VSCode Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--watchAll=false"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Single Test
```bash
npm test -- --testNamePattern="should create product"
```

### Verbose Output
```bash
npm test -- --verbose
```

## Common Issues

### 1. Timeout Errors
```typescript
// Increase timeout for slow operations
jest.setTimeout(10000);

// Or per test
it('should handle large dataset', async () => {
  // test code
}, 10000);
```

### 2. Async Issues
```typescript
// Always await async operations
it('should fetch data', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});
```

### 3. Mock Reset Issues
```typescript
// Ensure mocks are reset
beforeEach(() => {
  jest.clearAllMocks();
});
```