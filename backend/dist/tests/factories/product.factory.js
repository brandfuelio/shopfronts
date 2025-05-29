"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockProducts = exports.createMockProduct = void 0;
const faker_1 = require("@faker-js/faker");
const client_1 = require("@prisma/client");
const createMockProduct = (overrides) => {
    const name = faker_1.faker.commerce.productName();
    return {
        id: faker_1.faker.string.uuid(),
        name,
        slug: faker_1.faker.helpers.slugify(name).toLowerCase(),
        description: faker_1.faker.commerce.productDescription(),
        price: parseFloat(faker_1.faker.commerce.price()),
        originalPrice: null,
        features: [faker_1.faker.lorem.sentence(), faker_1.faker.lorem.sentence()],
        requirements: null,
        screenshots: [faker_1.faker.image.url(), faker_1.faker.image.url()],
        thumbnail: faker_1.faker.image.url(),
        downloadUrl: null,
        fileSize: null,
        version: null,
        lastUpdate: faker_1.faker.date.recent(),
        status: client_1.ProductStatus.ACTIVE,
        metaTitle: null,
        metaDescription: null,
        categoryId: faker_1.faker.string.uuid(),
        sellerId: faker_1.faker.string.uuid(),
        totalSales: 0,
        totalDownloads: 0,
        averageRating: 0,
        reviewCount: 0,
        stock: faker_1.faker.number.int({ min: 0, max: 100 }),
        specifications: {},
        isActive: true,
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.recent(),
        ...overrides,
    };
};
exports.createMockProduct = createMockProduct;
const createMockProducts = (count, overrides) => {
    return Array.from({ length: count }, () => (0, exports.createMockProduct)(overrides));
};
exports.createMockProducts = createMockProducts;
//# sourceMappingURL=product.factory.js.map