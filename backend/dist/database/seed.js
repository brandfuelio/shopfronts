"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const categories = [
    { name: 'Productivity', slug: 'productivity', description: 'Tools to boost your productivity' },
    { name: 'Design Tools', slug: 'design-tools', description: 'Creative design applications' },
    { name: 'Development', slug: 'development', description: 'Developer tools and utilities' },
    { name: 'Marketing', slug: 'marketing', description: 'Marketing and analytics tools' },
    { name: 'Finance', slug: 'finance', description: 'Financial management software' },
    { name: 'Education', slug: 'education', description: 'Educational resources and tools' },
    { name: 'Entertainment', slug: 'entertainment', description: 'Games and entertainment apps' },
    { name: 'Security', slug: 'security', description: 'Security and privacy tools' },
];
const seedDatabase = async () => {
    try {
        logger_1.logger.info('🌱 Starting database seed...');
        // Clear existing data
        await prisma.review.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.chatMessage.deleteMany();
        await prisma.chatSession.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
        logger_1.logger.info('✅ Cleared existing data');
        // Create categories
        const createdCategories = await Promise.all(categories.map(cat => prisma.category.create({ data: cat })));
        logger_1.logger.info(`✅ Created ${createdCategories.length} categories`);
        // Create users
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@shopfronts.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
                emailVerified: true,
            },
        });
        const sellerUser = await prisma.user.create({
            data: {
                email: 'seller@shopfronts.com',
                password: hashedPassword,
                name: 'John Seller',
                role: 'SELLER',
                emailVerified: true,
            },
        });
        const customerUser = await prisma.user.create({
            data: {
                email: 'customer@shopfronts.com',
                password: hashedPassword,
                name: 'Jane Customer',
                role: 'CUSTOMER',
                emailVerified: true,
            },
        });
        logger_1.logger.info('✅ Created users');
        // Create products
        const productData = [
            {
                name: 'TaskMaster Pro',
                description: 'Advanced task management and productivity suite',
                price: 49.99,
                categoryId: createdCategories[0].id,
                sellerId: sellerUser.id,
                features: ['Task tracking', 'Team collaboration', 'Time tracking', 'Reports'],
                images: ['/api/placeholder/400/300'],
                status: 'ACTIVE',
            },
            {
                name: 'DesignFlow Studio',
                description: 'Professional design tool for creators',
                price: 79.99,
                categoryId: createdCategories[1].id,
                sellerId: sellerUser.id,
                features: ['Vector graphics', 'Photo editing', 'Templates', 'Cloud sync'],
                images: ['/api/placeholder/400/300'],
                status: 'ACTIVE',
            },
            {
                name: 'CodeBoost IDE',
                description: 'Intelligent code editor with AI assistance',
                price: 99.99,
                categoryId: createdCategories[2].id,
                sellerId: sellerUser.id,
                features: ['AI code completion', 'Debugging tools', 'Git integration', 'Extensions'],
                images: ['/api/placeholder/400/300'],
                status: 'ACTIVE',
            },
            {
                name: 'MarketAnalyzer',
                description: 'Comprehensive marketing analytics platform',
                price: 149.99,
                categoryId: createdCategories[3].id,
                sellerId: sellerUser.id,
                features: ['Real-time analytics', 'A/B testing', 'SEO tools', 'Social media tracking'],
                images: ['/api/placeholder/400/300'],
                status: 'ACTIVE',
            },
            {
                name: 'FinanceTracker Plus',
                description: 'Personal finance management made easy',
                price: 39.99,
                categoryId: createdCategories[4].id,
                sellerId: sellerUser.id,
                features: ['Expense tracking', 'Budget planning', 'Investment tracking', 'Reports'],
                images: ['/api/placeholder/400/300'],
                status: 'ACTIVE',
            },
        ];
        const products = await Promise.all(productData.map(data => prisma.product.create({ data })));
        logger_1.logger.info(`✅ Created ${products.length} products`);
        // Create sample reviews
        const reviewData = [
            {
                productId: products[0].id,
                userId: customerUser.id,
                rating: 5,
                title: 'Excellent productivity tool!',
                comment: 'This has completely transformed how I manage my tasks. Highly recommended!',
            },
            {
                productId: products[0].id,
                userId: adminUser.id,
                rating: 4,
                title: 'Great features, minor issues',
                comment: 'Love the features, but could use some UI improvements.',
            },
            {
                productId: products[1].id,
                userId: customerUser.id,
                rating: 5,
                title: 'Best design tool ever!',
                comment: 'Intuitive interface and powerful features. Worth every penny.',
            },
        ];
        await Promise.all(reviewData.map(data => prisma.review.create({ data })));
        logger_1.logger.info('✅ Created sample reviews');
        // Create a cart for the customer
        const cart = await prisma.cart.create({
            data: {
                userId: customerUser.id,
                items: {
                    create: [
                        {
                            productId: products[0].id,
                            quantity: 1,
                        },
                        {
                            productId: products[2].id,
                            quantity: 1,
                        },
                    ],
                },
            },
        });
        logger_1.logger.info('✅ Created sample cart');
        // Create a sample order
        const order = await prisma.order.create({
            data: {
                userId: customerUser.id,
                total: products[0].price + products[1].price,
                status: 'COMPLETED',
                items: {
                    create: [
                        {
                            productId: products[0].id,
                            quantity: 1,
                            price: products[0].price,
                        },
                        {
                            productId: products[1].id,
                            quantity: 1,
                            price: products[1].price,
                        },
                    ],
                },
            },
        });
        logger_1.logger.info('✅ Created sample order');
        // Create a chat session
        const chatSession = await prisma.chatSession.create({
            data: {
                userId: customerUser.id,
                title: 'Product recommendations',
                messages: {
                    create: [
                        {
                            role: 'user',
                            content: 'Can you recommend a good task management tool?',
                        },
                        {
                            role: 'assistant',
                            content: 'I recommend TaskMaster Pro! It offers comprehensive task tracking, team collaboration features, and detailed reporting. It\'s perfect for both personal and team productivity.',
                        },
                    ],
                },
            },
        });
        logger_1.logger.info('✅ Created sample chat session');
        logger_1.logger.info('🎉 Database seed completed successfully!');
        logger_1.logger.info('📧 Test accounts:');
        logger_1.logger.info('   Admin: admin@shopfronts.com / password123');
        logger_1.logger.info('   Seller: seller@shopfronts.com / password123');
        logger_1.logger.info('   Customer: customer@shopfronts.com / password123');
    }
    catch (error) {
        logger_1.logger.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
};
// Run seed if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
exports.default = seedDatabase;
//# sourceMappingURL=seed.js.map