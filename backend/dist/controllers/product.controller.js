"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
// Get all products with filtering, sorting, and pagination
const getProducts = async (req, res, next) => {
    try {
        const { page = '1', limit = '12', category, minPrice, maxPrice, search, sortBy = 'createdAt', order = 'desc', sellerId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {
            isActive: true
        };
        if (category) {
            where.categoryId = category;
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Build orderBy
        const orderBy = {};
        if (sortBy === 'price' || sortBy === 'name' || sortBy === 'createdAt') {
            orderBy[sortBy] = order;
        }
        // Get products with relations
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
                include: {
                    category: true,
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            sellerProfile: { select: { businessName: true } }
                        }
                    },
                    images: true,
                    _count: {
                        select: {
                            reviews: true,
                            orderItems: true
                        }
                    }
                }
            }),
            database_1.prisma.product.count({ where })
        ]);
        // Calculate average ratings
        const productsWithRatings = await Promise.all(products.map(async (product) => {
            const avgRating = await database_1.prisma.review.aggregate({
                where: { productId: product.id },
                _avg: { rating: true }
            });
            return {
                ...product,
                averageRating: avgRating._avg.rating || 0,
                reviewCount: product._count.reviews,
                soldCount: product._count.orderItems
            };
        }));
        res.json({
            success: true,
            data: {
                products: productsWithRatings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// Get single product by ID
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        sellerProfile: {
                            select: {
                                businessName: true,
                                description: true
                            }
                        }
                    }
                },
                images: true,
                reviews: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        if (!product) {
            throw new errorHandler_1.AppError('Product not found', 404);
        }
        // Get aggregate data
        const [avgRating, reviewCount, soldCount] = await Promise.all([
            database_1.prisma.review.aggregate({
                where: { productId: id },
                _avg: { rating: true }
            }),
            database_1.prisma.review.count({
                where: { productId: id }
            }),
            database_1.prisma.orderItem.count({
                where: { productId: id }
            })
        ]);
        res.json({
            success: true,
            data: {
                ...product,
                averageRating: avgRating._avg.rating || 0,
                reviewCount,
                soldCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
// Create new product (seller only)
const createProduct = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const { name, description, price, categoryId, stock, images, specifications } = req.body;
        // Verify user is a seller
        const seller = await database_1.prisma.user.findUnique({
            where: { id: sellerId, role: 'SELLER' }
        });
        if (!seller) {
            throw new errorHandler_1.AppError('Only sellers can create products', 403);
        }
        // Create product with images
        const product = await database_1.prisma.product.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                description,
                price,
                thumbnail: images?.[0]?.url || '',
                categoryId,
                sellerId,
                stock: stock || 0,
                specifications: specifications || {},
                images: {
                    create: images?.map((img) => ({
                        url: img.url,
                        alt: img.alt || name
                    })) || []
                }
            },
            include: {
                category: true,
                images: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        sellerProfile: { select: { businessName: true } }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
// Update product (seller only)
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;
        const updates = req.body;
        // Check if product exists and belongs to seller
        const product = await database_1.prisma.product.findUnique({
            where: { id }
        });
        if (!product) {
            throw new errorHandler_1.AppError('Product not found', 404);
        }
        if (product.sellerId !== sellerId) {
            throw new errorHandler_1.AppError('You can only update your own products', 403);
        }
        // Handle image updates if provided
        if (updates.images) {
            // Delete existing images
            await database_1.prisma.productImage.deleteMany({
                where: { productId: id }
            });
            // Create new images
            updates.images = {
                create: updates.images.map((img) => ({
                    url: img.url,
                    alt: img.alt || updates.name || product.name
                }))
            };
        }
        // Update product
        const updatedProduct = await database_1.prisma.product.update({
            where: { id },
            data: updates,
            include: {
                category: true,
                images: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        sellerProfile: { select: { businessName: true } }
                    }
                }
            }
        });
        res.json({
            success: true,
            data: updatedProduct
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
// Delete product (seller only)
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;
        // Check if product exists and belongs to seller
        const product = await database_1.prisma.product.findUnique({
            where: { id }
        });
        if (!product) {
            throw new errorHandler_1.AppError('Product not found', 404);
        }
        if (product.sellerId !== sellerId) {
            throw new errorHandler_1.AppError('You can only delete your own products', 403);
        }
        // Soft delete by setting isActive to false
        await database_1.prisma.product.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
// Get products by category
const getProductsByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { page = '1', limit = '12' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Check if category exists
        const category = await database_1.prisma.category.findUnique({
            where: { id: categoryId }
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        // Get products
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where: {
                    categoryId,
                    isActive: true
                },
                skip,
                take: limitNum,
                include: {
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            sellerProfile: { select: { businessName: true } }
                        }
                    },
                    images: true,
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                }
            }),
            database_1.prisma.product.count({
                where: {
                    categoryId,
                    isActive: true
                }
            })
        ]);
        res.json({
            success: true,
            data: {
                category,
                products,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsByCategory = getProductsByCategory;
// Search products
const searchProducts = async (req, res, next) => {
    try {
        const { q, page = '1', limit = '12' } = req.query;
        if (!q) {
            throw new errorHandler_1.AppError('Search query is required', 400);
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const searchQuery = q;
        // Search in name, description, and category name
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: searchQuery, mode: 'insensitive' } },
                        { description: { contains: searchQuery, mode: 'insensitive' } },
                        {
                            category: {
                                name: { contains: searchQuery, mode: 'insensitive' }
                            }
                        }
                    ]
                },
                skip,
                take: limitNum,
                include: {
                    category: true,
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            sellerProfile: { select: { businessName: true } }
                        }
                    },
                    images: true
                }
            }),
            database_1.prisma.product.count({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: searchQuery, mode: 'insensitive' } },
                        { description: { contains: searchQuery, mode: 'insensitive' } },
                        {
                            category: {
                                name: { contains: searchQuery, mode: 'insensitive' }
                            }
                        }
                    ]
                }
            })
        ]);
        res.json({
            success: true,
            data: {
                query: searchQuery,
                products,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchProducts = searchProducts;
//# sourceMappingURL=product.controller.js.map