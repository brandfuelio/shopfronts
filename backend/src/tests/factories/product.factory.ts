import { faker } from '@faker-js/faker';
import { Product, ProductStatus } from '@prisma/client';

export const createMockProduct = (overrides?: Partial<Product>): Product => {
  const name = faker.commerce.productName();
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    originalPrice: null,
    features: [faker.lorem.sentence(), faker.lorem.sentence()],
    requirements: null,
    screenshots: [faker.image.url(), faker.image.url()],
    thumbnail: faker.image.url(),
    downloadUrl: null,
    fileSize: null,
    version: null,
    lastUpdate: faker.date.recent(),
    status: ProductStatus.ACTIVE,
    metaTitle: null,
    metaDescription: null,
    categoryId: faker.string.uuid(),
    sellerId: faker.string.uuid(),
    totalSales: 0,
    totalDownloads: 0,
    averageRating: 0,
    reviewCount: 0,
    stock: faker.number.int({ min: 0, max: 100 }),
    specifications: {},
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
};

export const createMockProducts = (count: number, overrides?: Partial<Product>): Product[] => {
  return Array.from({ length: count }, () => createMockProduct(overrides));
};