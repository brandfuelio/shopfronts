import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import chatRoutes from './chat.routes';
import sellerRoutes from './seller.routes';
import adminRoutes from './admin.routes';
import paymentRoutes from './payment.routes';
import fileRoutes from './file.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import monitoringRoutes from './monitoring.routes';
import cacheRoutes from './cache.routes';
import performanceRoutes from './performance.routes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/chat', chatRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);
router.use('/files', fileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/cache', cacheRoutes);
router.use('/performance', performanceRoutes);

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

export default router;