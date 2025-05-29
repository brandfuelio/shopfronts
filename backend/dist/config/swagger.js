"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../../package.json");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ShopFronts API',
            version: package_json_1.version,
            description: 'AI-powered digital product marketplace API documentation',
            contact: {
                name: 'ShopFronts Team',
                email: 'support@shopfronts.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
            {
                url: 'https://api.shopfronts.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                    },
                                    message: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        name: {
                            type: 'string',
                        },
                        role: {
                            type: 'string',
                            enum: ['BUYER', 'SELLER', 'ADMIN'],
                        },
                        avatar: {
                            type: 'string',
                            nullable: true,
                        },
                        bio: {
                            type: 'string',
                            nullable: true,
                        },
                        emailVerified: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        stock: {
                            type: 'integer',
                        },
                        categoryId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        sellerId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                        },
                        total: {
                            type: 'number',
                            format: 'float',
                        },
                        shippingAddress: {
                            type: 'object',
                            properties: {
                                street: {
                                    type: 'string',
                                },
                                city: {
                                    type: 'string',
                                },
                                state: {
                                    type: 'string',
                                },
                                zipCode: {
                                    type: 'string',
                                },
                                country: {
                                    type: 'string',
                                },
                            },
                        },
                        paymentIntentId: {
                            type: 'string',
                            nullable: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                ChatMessage: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        conversationId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'assistant'],
                        },
                        content: {
                            type: 'string',
                        },
                        metadata: {
                            type: 'object',
                            nullable: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization',
            },
            {
                name: 'Users',
                description: 'User management operations',
            },
            {
                name: 'Products',
                description: 'Product catalog operations',
            },
            {
                name: 'Orders',
                description: 'Order management operations',
            },
            {
                name: 'Cart',
                description: 'Shopping cart operations',
            },
            {
                name: 'AI Chat',
                description: 'AI-powered chat operations',
            },
            {
                name: 'Payments',
                description: 'Payment processing operations',
            },
            {
                name: 'Analytics',
                description: 'Analytics and reporting',
            },
            {
                name: 'Admin',
                description: 'Administrative operations',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map