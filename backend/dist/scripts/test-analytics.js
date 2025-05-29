"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const faker_1 = require("@faker-js/faker");
const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
let authToken;
let sessionId;
async function login() {
    try {
        const response = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123',
        });
        authToken = response.data.data.token;
        console.log('✅ Logged in successfully');
    }
    catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}
async function testAnalyticsTracking() {
    console.log('\n📊 Testing Analytics Tracking...\n');
    // Generate session ID
    sessionId = faker_1.faker.string.uuid();
    // Track product views
    console.log('1. Tracking product views...');
    const productIds = ['prod_1', 'prod_2', 'prod_3'];
    for (const productId of productIds) {
        try {
            await axios_1.default.post(`${API_URL}/analytics/track/product/${productId}`, {
                referrer: faker_1.faker.internet.url(),
                duration: faker_1.faker.number.int({ min: 5000, max: 60000 }),
            }, {
                headers: {
                    'X-Session-ID': sessionId,
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log(`   ✅ Tracked view for product ${productId}`);
        }
        catch (error) {
            console.error(`   ❌ Failed to track product view:`, error.response?.data || error.message);
        }
    }
    // Track search queries
    console.log('\n2. Tracking search queries...');
    const searchQueries = ['laptop', 'gaming chair', 'mechanical keyboard'];
    for (const query of searchQueries) {
        try {
            await axios_1.default.post(`${API_URL}/analytics/track/search`, {
                query,
                resultsCount: faker_1.faker.number.int({ min: 0, max: 100 }),
                clickedResults: faker_1.faker.helpers.arrayElements(productIds, faker_1.faker.number.int({ min: 0, max: 3 })),
            }, {
                headers: {
                    'X-Session-ID': sessionId,
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log(`   ✅ Tracked search for "${query}"`);
        }
        catch (error) {
            console.error(`   ❌ Failed to track search:`, error.response?.data || error.message);
        }
    }
    // Track custom events
    console.log('\n3. Tracking custom events...');
    const events = [
        { event: 'add_to_cart', category: 'engagement', properties: { productId: 'prod_1', quantity: 2 } },
        { event: 'remove_from_cart', category: 'engagement', properties: { productId: 'prod_2' } },
        { event: 'share_product', category: 'social', properties: { productId: 'prod_3', platform: 'twitter' } },
    ];
    for (const eventData of events) {
        try {
            await axios_1.default.post(`${API_URL}/analytics/track/event`, eventData, {
                headers: {
                    'X-Session-ID': sessionId,
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log(`   ✅ Tracked event: ${eventData.event}`);
        }
        catch (error) {
            console.error(`   ❌ Failed to track event:`, error.response?.data || error.message);
        }
    }
}
async function testAnalyticsRetrieval() {
    console.log('\n📈 Testing Analytics Retrieval...\n');
    // Get dashboard analytics
    console.log('1. Getting dashboard analytics...');
    try {
        const response = await axios_1.default.get(`${API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Dashboard analytics:', JSON.stringify(response.data.data, null, 2));
    }
    catch (error) {
        console.error('   ❌ Failed to get dashboard analytics:', error.response?.data || error.message);
    }
    // Get search analytics
    console.log('\n2. Getting search analytics...');
    try {
        const response = await axios_1.default.get(`${API_URL}/analytics/search`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Search analytics:', JSON.stringify(response.data.data, null, 2));
    }
    catch (error) {
        console.error('   ❌ Failed to get search analytics:', error.response?.data || error.message);
    }
    // Get user analytics
    console.log('\n3. Getting user analytics...');
    try {
        const response = await axios_1.default.get(`${API_URL}/analytics/users/user_1`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ User analytics:', JSON.stringify(response.data.data, null, 2));
    }
    catch (error) {
        console.error('   ❌ Failed to get user analytics:', error.response?.data || error.message);
    }
}
async function testMonitoring() {
    console.log('\n🔍 Testing Monitoring...\n');
    // Health check
    console.log('1. Health check...');
    try {
        const response = await axios_1.default.get(`${API_URL}/monitoring/health`);
        console.log('   ✅ Health status:', response.data.status);
        console.log('   Service checks:', JSON.stringify(response.data.checks, null, 2));
    }
    catch (error) {
        console.error('   ❌ Health check failed:', error.response?.data || error.message);
    }
    // System metrics
    console.log('\n2. Getting system metrics...');
    try {
        const response = await axios_1.default.get(`${API_URL}/monitoring/system`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ System metrics:', JSON.stringify(response.data.data, null, 2));
    }
    catch (error) {
        console.error('   ❌ Failed to get system metrics:', error.response?.data || error.message);
    }
    // Performance stats
    console.log('\n3. Getting performance stats...');
    try {
        const response = await axios_1.default.get(`${API_URL}/monitoring/performance?hours=1`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Performance stats:', JSON.stringify(response.data.data, null, 2));
    }
    catch (error) {
        console.error('   ❌ Failed to get performance stats:', error.response?.data || error.message);
    }
    // Prometheus metrics
    console.log('\n4. Getting Prometheus metrics...');
    try {
        const response = await axios_1.default.get(`${API_URL}/monitoring/metrics`);
        console.log('   ✅ Prometheus metrics (first 500 chars):', response.data.substring(0, 500) + '...');
    }
    catch (error) {
        console.error('   ❌ Failed to get Prometheus metrics:', error.response?.data || error.message);
    }
    // Test alert
    console.log('\n5. Creating test alert...');
    try {
        await axios_1.default.post(`${API_URL}/monitoring/alerts/test`, {
            type: 'Test Alert',
            message: 'This is a test alert from the analytics test script',
            severity: 'low',
        }, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('   ✅ Test alert created');
    }
    catch (error) {
        console.error('   ❌ Failed to create test alert:', error.response?.data || error.message);
    }
}
async function main() {
    console.log('🚀 Starting Analytics & Monitoring Tests\n');
    await login();
    await testAnalyticsTracking();
    await testAnalyticsRetrieval();
    await testMonitoring();
    console.log('\n✅ All tests completed!');
}
main().catch(console.error);
//# sourceMappingURL=test-analytics.js.map