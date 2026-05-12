import { Product, ProductVariant } from '../entities/product.entity';

export const IProductRepository = Symbol('IProductRepository');

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  findByCategory(categoryId: number): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>): Promise<Product>;
  update(id: number, product: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;
  createVariant(variant: Omit<ProductVariant, 'id' | 'createdAt'>): Promise<ProductVariant>;
  deleteVariant(variantId: number): Promise<void>;
}