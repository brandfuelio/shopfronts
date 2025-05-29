/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.integration.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Don't use mocks for integration tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.integration.ts'],
  testTimeout: 30000,
  verbose: true,
};