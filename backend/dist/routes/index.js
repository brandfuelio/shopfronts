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
            admin: '/admin'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map