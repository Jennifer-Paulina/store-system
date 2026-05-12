import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IProductRepository } from '../../domain/interfaces/product.repository.interface';
import { Product, ProductVariant } from '../../domain/entities/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: { variants: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    return product ? this.mapProduct(product) : null;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      include: { variants: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        isActive: product.isActive,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
      },
      include: { variants: true },
    });
    return this.mapProduct(created);
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        isActive: product.isActive,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
      },
      include: { variants: true },
    });
    return this.mapProduct(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async createVariant(variant: Omit<ProductVariant, 'id' | 'createdAt'>): Promise<ProductVariant> {
    return await this.prisma.productVariant.create({
      data: variant,
    });
  }

  async deleteVariant(variantId: number): Promise<void> {
    await this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  private mapProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      isActive: product.isActive,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: product.variants,
    };
  }
}