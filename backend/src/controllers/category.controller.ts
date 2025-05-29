import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get all categories
export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({
      success: true,
      data: categories.map((cat: any) => ({
        ...cat,
        productCount: cat._count.products
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create category (admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, icon } = req.body;

    // Check if category with same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      throw new AppError('Category with this name already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // If name is being changed, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name }
      });

      if (existingCategory) {
        throw new AppError('Category with this name already exists', 400);
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        slug: name ? name.toLowerCase().replace(/\s+/g, '-') : undefined
      }
    });

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new AppError('Cannot delete category with existing products', 400);
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};