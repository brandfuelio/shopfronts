"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockOrderItems = exports.createMockOrders = exports.createMockOrderItem = exports.createMockOrder = void 0;
const faker_1 = require("@faker-js/faker");
const client_1 = require("@prisma/client");
const createMockOrder = (overrides) => {
    const subtotal = parseFloat(faker_1.faker.commerce.price({ min: 10, max: 1000 }));
    const tax = subtotal * 0.1;
    const shipping = 10;
    const total = subtotal + tax + shipping;
    return {
        id: faker_1.faker.string.uuid(),
        orderNumber: `ORD-${faker_1.faker.string.alphanumeric(8).toUpperCase()}`,
        userId: faker_1.faker.string.uuid(),
        status: faker_1.faker.helpers.enumValue(client_1.OrderStatus),
        paymentStatus: faker_1.faker.helpers.enumValue(client_1.PaymentStatus),
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: null,
        paymentId: null,
        paymentIntentId: faker_1.faker.string.alphanumeric(20),
        checkoutSessionId: null,
        paymentDetails: null,
        refundStatus: null,
        refundDetails: null,
        shippingAddress: {
            street: faker_1.faker.location.streetAddress(),
            city: faker_1.faker.location.city(),
            state: faker_1.faker.location.state(),
            zipCode: faker_1.faker.location.zipCode(),
            country: faker_1.faker.location.country(),
        },
        notes: null,
        shippedAt: null,
        deliveredAt: null,
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides,
    };
};
exports.createMockOrder = createMockOrder;
const createMockOrderItem = (overrides) => {
    const quantity = faker_1.faker.number.int({ min: 1, max: 5 });
    const price = parseFloat(faker_1.faker.commerce.price());
    return {
        id: faker_1.faker.string.uuid(),
        orderId: faker_1.faker.string.uuid(),
        productId: faker_1.faker.string.uuid(),
        quantity,
        price,
        total: price * quantity,
        downloadCount: 0,
        downloadToken: null,
        downloadExpiry: null,
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides,
    };
};
exports.createMockOrderItem = createMockOrderItem;
const createMockOrders = (count, overrides) => {
    return Array.from({ length: count }, () => (0, exports.createMockOrder)(overrides));
};
exports.createMockOrders = createMockOrders;
const createMockOrderItems = (count, overrides) => {
    return Array.from({ length: count }, () => (0, exports.createMockOrderItem)(overrides));
};
exports.createMockOrderItems = createMockOrderItems;
//# sourceMappingURL=order.factory.js.map