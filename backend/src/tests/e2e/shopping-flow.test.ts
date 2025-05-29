import request from 'supertest';
import express from 'express';
import { prismaMock } from '../setup';
import { createMockUser, createMockProduct, createMockOrder } from '../factories';
import { UserRole, OrderStatus } from '@prisma/client';

import bcrypt from 'bcryptjs';

// Import all routes
import authRoutes from '../../routes/auth.routes';
import productRoutes from '../../routes/product.routes';
import orderRoutes from '../../routes/order.routes';
import cartRoutes from '../../routes/cart.routes';
import { errorHandler } from '../../middleware/errorHandler';

// Setup Express app with all routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use(errorHandler);

describe('E2E Shopping Flow', () => {
  let buyerToken: string;
  let buyerId: string;
  let productId: string;

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

      const mockBuyer = createMockUser({
        id: buyerId,
        ...buyerData,
        password: await bcrypt.hash(buyerData.password, 10),
        role: UserRole.CUSTOMER,
      });

      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce(mockBuyer);

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(buyerData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      buyerToken = registerResponse.body.data.token;

      // Step 2: Browse products
      const mockProducts = [
        createMockProduct({ id: productId, name: 'Test Product', price: 99.99 }),
        createMockProduct({ name: 'Another Product', price: 149.99 }),
      ];

      prismaMock.product.findMany.mockResolvedValueOnce(mockProducts);
      prismaMock.product.count.mockResolvedValueOnce(2);

      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      expect(productsResponse.body.success).toBe(true);
      expect(productsResponse.body.data.products).toHaveLength(2);

      // Step 3: View product details
      prismaMock.product.findUnique.mockResolvedValueOnce(mockProducts[0]);

      const productDetailResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(productDetailResponse.body.success).toBe(true);
      expect(productDetailResponse.body.data.id).toBe(productId);

      // Step 4: Add to cart
      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.cartItem.findUnique.mockResolvedValueOnce(null);
      prismaMock.product.findUnique.mockResolvedValueOnce(mockProducts[0]);
      prismaMock.cartItem.create.mockResolvedValueOnce({
        id: 'cart-item-id',
        userId: buyerId,
        productId: productId,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const addToCartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId, quantity: 2 })
        .expect(200);

      expect(addToCartResponse.body.success).toBe(true);

      // Step 5: View cart
      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.cartItem.findMany.mockResolvedValueOnce([
        {
          id: 'cart-item-id',
          userId: buyerId,
          productId: productId,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(cartResponse.body.success).toBe(true);
      expect(cartResponse.body.data.items).toHaveLength(1);

      // Step 6: Create order
      const mockOrder = createMockOrder({
        id: 'order-id',
        userId: buyerId,
        status: OrderStatus.PENDING,
        total: 199.98,
      });

      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.cartItem.findMany.mockResolvedValueOnce([
        {
          id: 'cart-item-id',
          userId: buyerId,
          productId: productId,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      prismaMock.order.create.mockResolvedValueOnce(mockOrder);
      prismaMock.cartItem.deleteMany.mockResolvedValueOnce({ count: 1 });

      const createOrderResponse = await request(app)
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
      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.order.findMany.mockResolvedValueOnce([mockOrder]);

      const ordersResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(ordersResponse.body.success).toBe(true);
      expect(ordersResponse.body.data).toHaveLength(1);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle unauthorized access', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);

      await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
    });

    it('should handle invalid product in cart', async () => {
      const mockBuyer = createMockUser({ id: buyerId });
      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: 'non-existent-id', quantity: 1 })
        .expect(404);
    });

    it('should handle out of stock products', async () => {
      const mockBuyer = createMockUser({ id: buyerId });
      const outOfStockProduct = createMockProduct({ id: productId, stock: 0 });

      prismaMock.user.findUnique.mockResolvedValueOnce(mockBuyer);
      prismaMock.product.findUnique.mockResolvedValueOnce(outOfStockProduct);

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId, quantity: 1 })
        .expect(400);
    });
  });
});