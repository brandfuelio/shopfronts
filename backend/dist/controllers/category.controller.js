"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
// Get all categories
const getCategories = async (_req, res, next) => {
    try {
        const categories = await database_1.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        res.json({
            success: true,
            data: categories.map((cat) => ({
                ...cat,
                productCount: cat._count.products
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Get category by ID
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await database_1.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        res.json({
            success: true,
            data: {
                ...category,
                productCount: category._count.products
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
// Create category (admin only)
const createCategory = async (req, res, next) => {
    try {
        const { name, description, icon } = req.body;
        // Check if category with same name exists
        const existingCategory = await database_1.prisma.category.findUnique({
            where: { name }
        });
        if (existingCategory) {
            throw new errorHandler_1.AppError('Category with this name already exists', 400);
        }
        const category = await database_1.prisma.category.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
// Update category (admin only)
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;
        // Check if category exists
        const category = await database_1.prisma.category.findUnique({
            where: { id }
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        // If name is being changed, check for duplicates
        if (name && name !== category.name) {
            const existingCategory = await database_1.prisma.category.findUnique({
                where: { name }
            });
            if (existingCategory) {
                throw new errorHandler_1.AppError('Category with this name already exists', 400);
            }
        }
        const updatedCategory = await database_1.prisma.category.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
// Delete category (admin only)
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if category exists
        const category = await database_1.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        // Check if category has products
        if (category._count.products > 0) {
            throw new errorHandler_1.AppError('Cannot delete category with existing products', 400);
        }
        await database_1.prisma.category.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map