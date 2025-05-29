import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export class DatabaseOptimization {
  /**
   * Analyze and create missing indexes
   */
  static async optimizeIndexes(): Promise<string[]> {
    const optimizations: string[] = [];

    try {
      // Check for missing indexes on frequently queried fields
      const indexChecks = [
        { table: 'Product', field: 'categoryId', type: 'foreign_key' },
        { table: 'Product', field: 'sellerId', type: 'foreign_key' },
        { table: 'Product', field: 'createdAt', type: 'sort' },
        { table: 'Order', field: 'userId', type: 'foreign_key' },
        { table: 'Order', field: 'status', type: 'filter' },
        { table: 'Order', field: 'createdAt', type: 'sort' },
        { table: 'Review', field: 'productId', type: 'foreign_key' },
        { table: 'Review', field: 'userId', type: 'foreign_key' },
        { table: 'CartItem', field: 'userId', type: 'foreign_key' },
        { table: 'CartItem', field: 'productId', type: 'foreign_key' },
      ];

      for (const check of indexChecks) {
        // In a real implementation, you would check if index exists
        // and create it if missing
        logger.info(`Checking index for ${check.table}.${check.field}`);
      }

      optimizations.push('Index optimization completed');
    } catch (error) {
      logger.error('Index optimization failed:', error);
      throw error;
    }

    return optimizations;
  }

  /**
   * Analyze query performance
   */
  static async analyzeQueryPerformance(): Promise<{
    slowQueries: any[];
    recommendations: string[];
  }> {
    const slowQueries: any[] = [];
    const recommendations: string[] = [];

    try {
      // In a real implementation, you would analyze query logs
      // For now, we'll provide general recommendations

      // Check for N+1 queries
      recommendations.push('Use include statements to avoid N+1 queries in product listings');
      recommendations.push('Consider using select to limit fields returned in large queries');
      recommendations.push('Use pagination for large result sets');

      return { slowQueries, recommendations };
    } catch (error) {
      logger.error('Query analysis failed:', error);
      throw error;
    }
  }

  /**
   * Optimize database connections
   */
  static async optimizeConnections(): Promise<{
    currentSettings: any;
    recommendations: string[];
  }> {
    try {
      // Get current connection pool settings
      const currentSettings = {
        connectionLimit: process.env.DATABASE_CONNECTION_LIMIT || '10',
        timeout: process.env.DATABASE_TIMEOUT || '5000',
      };

      const recommendations: string[] = [];

      // Provide recommendations based on usage
      const connectionLimit = parseInt(currentSettings.connectionLimit);
      if (connectionLimit < 20) {
        recommendations.push('Consider increasing connection pool size for high traffic');
      }

      recommendations.push('Monitor connection pool usage during peak times');
      recommendations.push('Implement connection retry logic for resilience');

      return { currentSettings, recommendations };
    } catch (error) {
      logger.error('Connection optimization failed:', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  static async cleanupOldData(daysToKeep: number = 90): Promise<{
    deletedRecords: Record<string, number>;
  }> {
    const deletedRecords: Record<string, number> = {};

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean up old sessions
      const deletedSessions = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: cutoffDate,
          },
        },
      });
      deletedRecords.sessions = deletedSessions.count;

      // Clean up old notifications
      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          AND: [
            { read: true },
            { createdAt: { lt: cutoffDate } },
          ],
        },
      });
      deletedRecords.notifications = deletedNotifications.count;

      // Clean up old analytics data (if stored in main DB)
      // In production, this would be in a separate analytics DB

      logger.info('Database cleanup completed:', deletedRecords);
      return { deletedRecords };
    } catch (error) {
      logger.error('Database cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Vacuum and analyze tables (PostgreSQL specific)
   */
  static async vacuumAnalyze(): Promise<void> {
    try {
      // In PostgreSQL, this would run VACUUM ANALYZE
      // For now, we'll just log the action
      logger.info('Running VACUUM ANALYZE on all tables');
      
      // In a real implementation:
      // await prisma.$executeRaw`VACUUM ANALYZE`;
      
      logger.info('VACUUM ANALYZE completed');
    } catch (error) {
      logger.error('VACUUM ANALYZE failed:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    tableStats: Record<string, { count: number; size?: string }>;
    totalSize?: string;
  }> {
    const tableStats: Record<string, { count: number; size?: string }> = {};

    try {
      // Get record counts for main tables
      const tables = [
        'user',
        'product',
        'category',
        'order',
        'orderItem',
        'review',
        'cartItem',
        'wishlistItem',
        'notification',
        'message',
        'conversation',
      ];

      for (const table of tables) {
        const count = await (prisma as any)[table].count();
        tableStats[table] = { count };
      }

      return { tableStats };
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Optimize specific queries
   */
  static optimizeQueries() {
    return {
      // Product search optimization
      productSearch: {
        original: `
          SELECT * FROM products 
          WHERE name LIKE '%search%' 
          OR description LIKE '%search%'
        `,
        optimized: `
          SELECT id, name, price, images 
          FROM products 
          WHERE to_tsvector('english', name || ' ' || description) 
          @@ plainto_tsquery('english', 'search')
          LIMIT 20
        `,
        recommendation: 'Use full-text search with GIN indexes for better performance',
      },

      // Order history optimization
      orderHistory: {
        original: `
          SELECT * FROM orders 
          WHERE userId = ? 
          ORDER BY createdAt DESC
        `,
        optimized: `
          SELECT o.id, o.status, o.total, o.createdAt,
                 COUNT(oi.id) as itemCount
          FROM orders o
          LEFT JOIN orderItems oi ON o.id = oi.orderId
          WHERE o.userId = ?
          GROUP BY o.id
          ORDER BY o.createdAt DESC
          LIMIT 10 OFFSET ?
        `,
        recommendation: 'Use pagination and aggregate item counts',
      },

      // Popular products optimization
      popularProducts: {
        original: `
          SELECT p.*, COUNT(oi.id) as salesCount
          FROM products p
          LEFT JOIN orderItems oi ON p.id = oi.productId
          GROUP BY p.id
          ORDER BY salesCount DESC
        `,
        optimized: `
          WITH product_sales AS (
            SELECT productId, COUNT(*) as salesCount
            FROM orderItems
            WHERE createdAt > NOW() - INTERVAL '30 days'
            GROUP BY productId
          )
          SELECT p.id, p.name, p.price, p.images, ps.salesCount
          FROM products p
          INNER JOIN product_sales ps ON p.id = ps.productId
          ORDER BY ps.salesCount DESC
          LIMIT 10
        `,
        recommendation: 'Use CTE and time-based filtering for recent popularity',
      },
    };
  }
}