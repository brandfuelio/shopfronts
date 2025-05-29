// Setup for integration tests
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Increase timeout for integration tests
jest.setTimeout(30000);