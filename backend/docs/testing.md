# Testing Guide

## Overview

The backend includes both unit tests and integration tests to ensure code quality and reliability.

## Unit Tests

Unit tests are located in `__tests__` directories and test individual components in isolation.

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit
```

### Current Status

✅ Auth Service: 10/10 tests passing
- User registration
- User login
- Token generation
- Token refresh
- Password hashing
- User validation

## Integration Tests

Integration tests validate the full request/response cycle and require a running PostgreSQL database.

### Prerequisites

1. PostgreSQL database running on localhost:5432
2. Test database created: `shopfronts_test`
3. Database migrations applied to test database

### Setup

```bash
# Create test database
createdb shopfronts_test

# Apply migrations to test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopfronts_test?schema=public" npx prisma migrate deploy

# Run integration tests
npm run test:integration
```

### Environment Variables

Integration tests use `.env.test` for configuration. Key variables:
- `DATABASE_URL`: PostgreSQL connection string for test database
- `NODE_ENV`: Set to "test"
- `PORT`: Different from development port to avoid conflicts

### Test Structure

Integration tests are located in `src/tests/integration/` and use:
- Supertest for HTTP testing
- Real database connections (not mocked)
- Database cleanup between tests
- Separate Jest configuration (`jest.integration.config.js`)

## Mocking

Unit tests use mocks for external dependencies:
- Prisma client (via jest-mock-extended)
- Redis client
- Email service
- Payment service

Mocks are located in `__mocks__` directories adjacent to the modules they mock.

## Best Practices

1. **Isolation**: Unit tests should not depend on external services
2. **Cleanup**: Integration tests should clean up test data
3. **Naming**: Use descriptive test names that explain the scenario
4. **Coverage**: Aim for >80% code coverage
5. **Speed**: Keep unit tests fast (<100ms per test)

## Troubleshooting

### Integration Tests Failing

1. Check PostgreSQL is running: `pg_isready`
2. Verify test database exists: `psql -l | grep shopfronts_test`
3. Check migrations are applied: `npx prisma migrate status`
4. Verify `.env.test` configuration

### Mock Issues

1. Clear Jest cache: `npm test -- --clearCache`
2. Check mock implementations match real interfaces
3. Verify mock paths in Jest configuration

## CI/CD Considerations

For continuous integration:
1. Use Docker Compose for test database
2. Run migrations before tests
3. Use separate test databases per test suite
4. Clean up resources after test runs