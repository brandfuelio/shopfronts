import { faker } from '@faker-js/faker';
import { Order, OrderStatus, OrderItem, PaymentStatus } from '@prisma/client';

export const createMockOrder = (overrides?: Partial<Order>): Order => {
  const subtotal = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
  const tax = subtotal * 0.1;
  const shipping = 10;
  const total = subtotal + tax + shipping;
  
  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
    userId: faker.string.uuid(),
    status: faker.helpers.enumValue(OrderStatus),
    paymentStatus: faker.helpers.enumValue(PaymentStatus),
    subtotal,
    tax,
    shipping,
    total,
    paymentMethod: null,
    paymentId: null,
    paymentIntentId: faker.string.alphanumeric(20),
    checkoutSessionId: null,
    paymentDetails: null,
    refundStatus: null,
    refundDetails: null,
    shippingAddress: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
    notes: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
};

export const createMockOrderItem = (overrides?: Partial<OrderItem>): OrderItem => {
  const quantity = faker.number.int({ min: 1, max: 5 });
  const price = parseFloat(faker.commerce.price());
  
  return {
    id: faker.string.uuid(),
    orderId: faker.string.uuid(),
    productId: faker.string.uuid(),
    quantity,
    price,
    total: price * quantity,
    downloadCount: 0,
    downloadToken: null,
    downloadExpiry: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
};

export const createMockOrders = (count: number, overrides?: Partial<Order>): Order[] => {
  return Array.from({ length: count }, () => createMockOrder(overrides));
};

export const createMockOrderItems = (count: number, overrides?: Partial<OrderItem>): OrderItem[] => {
  return Array.from({ length: count }, () => createMockOrderItem(overrides));
};