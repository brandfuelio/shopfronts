"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewById = exports.markReviewHelpful = exports.getUserReviews = exports.getProductReviews = exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
// Create a review
const createReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, rating, comment } = req.body;
        // Check if user has purchased this product
        const hasPurchased = await database_1.prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: client_1.OrderStatus.DELIVERED
                }
            }
        });
        if (!hasPurchased) {
            throw new errorHandler_1.AppError('You can only review products you have purchased', 403);
        }
        // Check if user already reviewed this product
        const existingReview = await database_1.prisma.review.findFirst({
            where: {
                userId,
                productId
            }
        });
        if (existingReview) {
            throw new errorHandler_1.AppError('You have already reviewed this product', 400);
        }
        // Create review
        const review = await database_1.prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        // Update product average rating
        const productReviews = await database_1.prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: true
        });
        await database_1.prisma.product.update({
            where: { id: productId },
            data: {
                averageRating: productReviews._avg.rating || 0,
                reviewCount: productReviews._count
            }
        });
        res.status(201).json({
            success: true,
            data: review
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
// Update a review
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;
        // Check if review exists and belongs to user
        const review = await database_1.prisma.review.findUnique({
            where: { id }
        });
        if (!review) {
            throw new errorHandler_1.AppError('Review not found', 404);
        }
        if (review.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to update this review', 403);
        }
        // Update review
        const updatedReview = await database_1.prisma.review.update({
            where: { id },
            data: {
                rating,
                comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        // Update product average rating
        const productReviews = await database_1.prisma.review.aggregate({
            where: { productId: review.productId },
            _avg: { rating: true },
            _count: true
        });
        await database_1.prisma.product.update({
            where: { id: review.productId },
            data: {
                averageRating: productReviews._avg.rating || 0,
                reviewCount: productReviews._count
            }
        });
        res.json({
            success: true,
            data: updatedReview
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReview = updateReview;
// Delete a review
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        // Check if review exists
        const review = await database_1.prisma.review.findUnique({
            where: { id }
        });
        if (!review) {
            throw new errorHandler_1.AppError('Review not found', 404);
        }
        // Check authorization
        if (userRole !== 'ADMIN' && review.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to delete this review', 403);
        }
        // Delete review
        await database_1.prisma.review.delete({
            where: { id }
        });
        // Update product average rating
        const productReviews = await database_1.prisma.review.aggregate({
            where: { productId: review.productId },
            _avg: { rating: true },
            _count: true
        });
        await database_1.prisma.product.update({
            where: { id: review.productId },
            data: {
                averageRating: productReviews._avg.rating || 0,
                reviewCount: productReviews._count
            }
        });
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
// Get reviews for a product
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Define sort order
        let orderBy = { createdAt: 'desc' };
        if (sort === 'rating-high') {
            orderBy = { rating: 'desc' };
        }
        else if (sort === 'rating-low') {
            orderBy = { rating: 'asc' };
        }
        else if (sort === 'helpful') {
            orderBy = { helpfulCount: 'desc' };
        }
        const [reviews, total] = await Promise.all([
            database_1.prisma.review.findMany({
                where: { productId },
                skip,
                take: Number(limit),
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy
            }),
            database_1.prisma.review.count({ where: { productId } })
        ]);
        // Get rating distribution
        const ratingDistribution = await database_1.prisma.review.groupBy({
            by: ['rating'],
            where: { productId },
            _count: true
        });
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };
        ratingDistribution.forEach(item => {
            distribution[item.rating] = item._count;
        });
        res.json({
            success: true,
            data: reviews,
            distribution,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductReviews = getProductReviews;
// Get user's reviews
const getUserReviews = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
            database_1.prisma.review.findMany({
                where: { userId },
                skip,
                take: Number(limit),
                include: {
                    product: {
                        include: {
                            images: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.review.count({ where: { userId } })
        ]);
        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserReviews = getUserReviews;
// Mark review as helpful
const markReviewHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if review exists
        const review = await database_1.prisma.review.findUnique({
            where: { id }
        });
        if (!review) {
            throw new errorHandler_1.AppError('Review not found', 404);
        }
        // Check if user already marked this review as helpful
        const existingVote = await database_1.prisma.reviewHelpful.findUnique({
            where: {
                userId_reviewId: {
                    userId,
                    reviewId: id
                }
            }
        });
        if (existingVote) {
            // Remove the vote
            await database_1.prisma.reviewHelpful.delete({
                where: {
                    userId_reviewId: {
                        userId,
                        reviewId: id
                    }
                }
            });
            await database_1.prisma.review.update({
                where: { id },
                data: {
                    helpfulCount: {
                        decrement: 1
                    }
                }
            });
            res.json({
                success: true,
                message: 'Helpful vote removed'
            });
        }
        else {
            // Add the vote
            await database_1.prisma.reviewHelpful.create({
                data: {
                    userId,
                    reviewId: id
                }
            });
            await database_1.prisma.review.update({
                where: { id },
                data: {
                    helpfulCount: {
                        increment: 1
                    }
                }
            });
            res.json({
                success: true,
                message: 'Marked as helpful'
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.markReviewHelpful = markReviewHelpful;
// Get review by ID
const getReviewById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await database_1.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                product: {
                    include: {
                        images: true
                    }
                }
            }
        });
        if (!review) {
            throw new errorHandler_1.AppError('Review not found', 404);
        }
        res.json({
            success: true,
            data: review
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewById = getReviewById;
//# sourceMappingURL=review.controller.js.map