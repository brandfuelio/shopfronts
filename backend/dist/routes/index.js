"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const seller_routes_1 = __importDefault(require("./seller.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const file_routes_1 = __importDefault(require("./file.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const monitoring_routes_1 = __importDefault(require("./monitoring.routes"));
const cache_routes_1 = __importDefault(require("./cache.routes"));
const performance_routes_1 = __importDefault(require("./performance.routes"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/cart', cart_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/reviews', review_routes_1.default);
router.use('/chat', chat_routes_1.default);
router.use('/seller', seller_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/payment', payment_routes_1.default);
router.use('/files', file_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/monitoring', monitoring_routes_1.default);
router.use('/cache', cache_routes_1.default);
router.use('/performance', performance_routes_1.default);
// API info endpoint
router.get('/', (_req, res) => {
    res.json({
        message: 'ShopFronts API v1',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            users: '/users',
            products: '/products',
            categories: '/categories',
            cart: '/cart',
            orders: '/orders',
            reviews: '/reviews',
            chat: '/chat',
            seller: '/seller',
            admin: '/admin',
            payment: '/payment',
            files: '/files'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map