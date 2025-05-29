"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-admin-token';
async function runTests() {
    const results = [];
    // Test 1: Cache Stats
    try {
        const response = await axios_1.default.get(`${API_URL}/cache/stats`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Cache Stats',
            success: true,
            message: 'Successfully retrieved cache statistics',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Cache Stats',
            success: false,
            message: error.message,
        });
    }
    // Test 2: Performance Analysis
    try {
        const response = await axios_1.default.get(`${API_URL}/performance/analysis`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Performance Analysis',
            success: true,
            message: 'Successfully analyzed performance',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Performance Analysis',
            success: false,
            message: error.message,
        });
    }
    // Test 3: Performance Report
    try {
        const response = await axios_1.default.get(`${API_URL}/performance/report`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Performance Report',
            success: true,
            message: 'Successfully generated performance report',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Performance Report',
            success: false,
            message: error.message,
        });
    }
    // Test 4: Cache Warming
    try {
        const response = await axios_1.default.post(`${API_URL}/cache/warm`, {}, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Cache Warming',
            success: true,
            message: 'Successfully warmed cache',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Cache Warming',
            success: false,
            message: error.message,
        });
    }
    // Test 5: Product List Caching
    try {
        // First request (cache miss)
        const start1 = Date.now();
        const response1 = await axios_1.default.get(`${API_URL}/products`);
        const time1 = Date.now() - start1;
        // Second request (cache hit)
        const start2 = Date.now();
        const response2 = await axios_1.default.get(`${API_URL}/products`);
        const time2 = Date.now() - start2;
        const cacheHit = response2.headers['x-cache-hit'] === 'true';
        const speedup = time1 / time2;
        results.push({
            test: 'Product List Caching',
            success: cacheHit && speedup > 1.5,
            message: `Cache ${cacheHit ? 'HIT' : 'MISS'}, Speedup: ${speedup.toFixed(2)}x (${time1}ms -> ${time2}ms)`,
            data: {
                firstRequest: time1,
                secondRequest: time2,
                cacheHit,
                speedup,
            },
        });
    }
    catch (error) {
        results.push({
            test: 'Product List Caching',
            success: false,
            message: error.message,
        });
    }
    // Test 6: Benchmark Endpoint
    try {
        const response = await axios_1.default.post(`${API_URL}/performance/benchmark`, {
            endpoint: '/api/products',
            method: 'GET',
        }, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Endpoint Benchmark',
            success: true,
            message: 'Successfully benchmarked endpoint',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Endpoint Benchmark',
            success: false,
            message: error.message,
        });
    }
    // Test 7: Auto-Optimization
    try {
        const response = await axios_1.default.post(`${API_URL}/performance/optimize`, {}, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Auto-Optimization',
            success: true,
            message: 'Successfully ran auto-optimization',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Auto-Optimization',
            success: false,
            message: error.message,
        });
    }
    // Test 8: Cache Invalidation
    try {
        // Create a product to test cache invalidation
        const createResponse = await axios_1.default.post(`${API_URL}/products`, {
            name: 'Test Cache Product',
            description: 'Testing cache invalidation',
            price: 99.99,
            stock: 10,
            categoryId: '123e4567-e89b-12d3-a456-426614174000', // Mock category ID
        }, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        // Check if product list cache was invalidated
        const listResponse = await axios_1.default.get(`${API_URL}/products`);
        const cacheHit = listResponse.headers['x-cache-hit'] === 'true';
        results.push({
            test: 'Cache Invalidation',
            success: !cacheHit,
            message: `Cache was ${cacheHit ? 'NOT ' : ''}invalidated after product creation`,
            data: {
                productCreated: createResponse.data.success,
                cacheInvalidated: !cacheHit,
            },
        });
    }
    catch (error) {
        results.push({
            test: 'Cache Invalidation',
            success: false,
            message: error.message,
        });
    }
    // Test 9: Memory Leak Detection
    try {
        const response = await axios_1.default.get(`${API_URL}/performance/memory-leaks`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Memory Leak Detection',
            success: true,
            message: 'Successfully checked for memory leaks',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Memory Leak Detection',
            success: false,
            message: error.message,
        });
    }
    // Test 10: Slow Query Analysis
    try {
        const response = await axios_1.default.get(`${API_URL}/performance/slow-queries?threshold=500`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        results.push({
            test: 'Slow Query Analysis',
            success: true,
            message: 'Successfully analyzed slow queries',
            data: response.data,
        });
    }
    catch (error) {
        results.push({
            test: 'Slow Query Analysis',
            success: false,
            message: error.message,
        });
    }
    // Print results
    console.log('\n=== Performance & Caching Test Results ===\n');
    results.forEach((result) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.test}: ${result.message}`);
        if (result.data && process.env.VERBOSE) {
            console.log('   Data:', JSON.stringify(result.data, null, 2));
        }
    });
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;
    console.log(`\n=== Summary: ${successCount}/${totalCount} tests passed ===\n`);
}
// Run tests
runTests().catch((error) => {
    logger_1.logger.error('Test script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-performance.js.map