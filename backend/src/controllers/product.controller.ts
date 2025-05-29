import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      sellerId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true
    };

    if (category) {
      where.categoryId = category as string;
    }

    if (sellerId) {
      where.sellerId = sellerId as string;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price' || sortBy === 'name' || sortBy === 'createdAt') {
      orderBy[sortBy] = order as Prisma.SortOrder;
    }

    // Get products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where })
    ]);

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product: any) => {
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        });

        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
          reviewCount: product._count.reviews,
          soldCount: product._count.orderItems
        };
      })
    );

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
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
      throw new AppError('Product not found', 404);
    }

    // Get aggregate data
    const [avgRating, reviewCount, soldCount] = await Promise.all([
      prisma.review.aggregate({
        where: { productId: id },
        _avg: { rating: true }
      }),
      prisma.review.count({
        where: { productId: id }
      }),
      prisma.orderItem.count({
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
  } catch (error) {
    next(error);
  }
};

// Create new product (seller only)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const {
      name,
      description,
      price,
      categoryId,
      stock,
      images,
      specifications
    } = req.body;

    // Verify user is a seller
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: 'SELLER' }
    });

    if (!seller) {
      throw new AppError('Only sellers can create products', 403);
    }

    // Create product with images
    const product = await prisma.product.create({
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
          create: images?.map((img: { url: string; alt?: string }) => ({
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
  } catch (error) {
    next(error);
  }
};

// Update product (seller only)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;
    const updates = req.body;

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.sellerId !== sellerId) {
      throw new AppError('You can only update your own products', 403);
    }

    // Handle image updates if provided
    if (updates.images) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });

      // Create new images
      updates.images = {
        create: updates.images.map((img: { url: string; alt?: string }) => ({
          url: img.url,
          alt: img.alt || updates.name || product.name
        }))
      };
    }

    // Update product
    const updatedProduct = await prisma.product.update({
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
  } catch (error) {
    next(error);
  }
};

// Delete product (seller only)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.sellerId !== sellerId) {
      throw new AppError('You can only delete your own products', 403);
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const { page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({
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
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page = '1', limit = '12' } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const searchQuery = q as string;

    // Search in name, description, and category name
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({
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
  } catch (error) {
    next(error);
  }
};