"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const setup_1 = require("../setup");
const factories_1 = require("../factories");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Import all routes
const auth_routes_1 = __importDefault(require("../../routes/auth.routes"));
const product_routes_1 = __importDefault(require("../../routes/product.routes"));
const order_routes_1 = __importDefault(require("../../routes/order.routes"));
const cart_routes_1 = __importDefault(require("../../routes/cart.routes"));
const errorHandler_1 = require("../../middleware/errorHandler");
// Setup Express app with all routes
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('E2E Shopping Flow', () => {
    let buyerToken;
    let buyerId;
    let productId;
    beforeAll(async () => {
        // Setup test data
        buyerId = 'test-buyer-id';
        productId = 'test-product-id';
    });
    describe('Complete Shopping Journey', () => {
        it('should complete full shopping flow from registration to order', async () => {
            // Step 1: Register as buyer
            const buyerData = {
                email: 'buyer@example.com',
                password: 'password123',
                name: 'Test Buyer',
                role: 'CUSTOMER',
            };
            const mockBuyer = (0, factories_1.createMockUser)({
                id: buyerId,
                ...buyerData,
                password: await bcryptjs_1.default.hash(buyerData.password, 10),
                role: client_1.UserRole.CUSTOMER,
            });
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
            setup_1.prismaMock.user.create.mockResolvedValueOnce(mockBuyer);
            const registerResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(buyerData)
                .expect(201);
            expect(registerResponse.body.success).toBe(true);
            buyerToken = registerResponse.body.data.token;
            // Step 2: Browse products
            const mockProducts = [
                (0, factories_1.createMockProduct)({ id: productId, name: 'Test Product', price: 99.99 }),
                (0, factories_1.createMockProduct)({ name: 'Another Product', price: 149.99 }),
            ];
            setup_1.prismaMock.product.findMany.mockResolvedValueOnce(mockProducts);
            setup_1.prismaMock.product.count.mockResolvedValueOnce(2);
            const productsResponse = await (0, supertest_1.default)(app)
                .get('/api/products')
                .expect(200);
            expect(productsResponse.body.success).toBe(true);
            expect(productsResponse.body.data.products).toHaveLength(2);
            // Step 3: View product details
            setup_1.prismaMock.product.findUnique.mockResolvedValueOnce(mockProducts[0]);
            const productDetailResponse = await (0, supertest_1.default)(app)
                .get(`/api/products/${productId}`)
                .expect(200);
            expect(productDetailResponse.body.success).toBe(true);
            expect(productDetailResponse.body.data.id).toBe(productId);
            // Step 4: Add to cart
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.cartItem.findUnique.mockResolvedValueOnce(null);
            setup_1.prismaMock.product.findUnique.mockResolvedValueOnce(mockProducts[0]);
            setup_1.prismaMock.cartItem.create.mockResolvedValueOnce({
                id: 'cart-item-id',
                userId: buyerId,
                productId: productId,
                quantity: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const addToCartResponse = await (0, supertest_1.default)(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200);
            expect(addToCartResponse.body.success).toBe(true);
            // Step 5: View cart
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'cart-item-id',
                    userId: buyerId,
                    productId: productId,
                    quantity: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
            const cartResponse = await (0, supertest_1.default)(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${buyerToken}`)
                .expect(200);
            expect(cartResponse.body.success).toBe(true);
            expect(cartResponse.body.data.items).toHaveLength(1);
            // Step 6: Create order
            const mockOrder = (0, factories_1.createMockOrder)({
                id: 'order-id',
                userId: buyerId,
                status: client_1.OrderStatus.PENDING,
                total: 199.98,
            });
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.cartItem.findMany.mockResolvedValueOnce([
                {
                    id: 'cart-item-id',
                    userId: buyerId,
                    productId: productId,
                    quantity: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
            setup_1.prismaMock.order.create.mockResolvedValueOnce(mockOrder);
            setup_1.prismaMock.cartItem.deleteMany.mockResolvedValueOnce({ count: 1 });
            const createOrderResponse = await (0, supertest_1.default)(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${buyerToken}`)
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
            expect(createOrderResponse.body.success).toBe(true);
            expect(createOrderResponse.body.data.id).toBe('order-id');
            // Step 7: View order history
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.order.findMany.mockResolvedValueOnce([mockOrder]);
            const ordersResponse = await (0, supertest_1.default)(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${buyerToken}`)
                .expect(200);
            expect(ordersResponse.body.success).toBe(true);
            expect(ordersResponse.body.data).toHaveLength(1);
        });
    });
    describe('Error Scenarios', () => {
        it('should handle unauthorized access', async () => {
            await (0, supertest_1.default)(app)
                .get('/api/cart')
                .expect(401);
            await (0, supertest_1.default)(app)
                .post('/api/orders')
                .send({})
                .expect(401);
        });
        it('should handle invalid product in cart', async () => {
            const mockBuyer = (0, factories_1.createMockUser)({ id: buyerId });
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.product.findUnique.mockResolvedValueOnce(null);
            await (0, supertest_1.default)(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ productId: 'non-existent-id', quantity: 1 })
                .expect(404);
        });
        it('should handle out of stock products', async () => {
            const mockBuyer = (0, factories_1.createMockUser)({ id: buyerId });
            const outOfStockProduct = (0, factories_1.createMockProduct)({ id: productId, stock: 0 });
            setup_1.prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
            setup_1.prismaMock.product.findUnique.mockResolvedValueOnce(outOfStockProduct);
            await (0, supertest_1.default)(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ productId, quantity: 1 })
                .expect(400);
        });
    });
});
//# sourceMappingURL=shopping-flow.test.js.map