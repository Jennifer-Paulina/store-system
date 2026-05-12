import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { IProductRepository } from '../../domain/interfaces/product.repository.interface';
import { Product, ProductVariant } from '../../domain/entities/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<Product[]> {
    this.prismaRead.checkAvailability();
    const products = await this.prismaRead.product.findMany({
      include: { variants: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  async findById(id: number): Promise<Product | null> {
    this.prismaRead.checkAvailability();
    const product = await this.prismaRead.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    return product ? this.mapProduct(product) : null;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    this.prismaRead.checkAvailability();
    const products = await this.prismaRead.product.findMany({
      where: { categoryId },
      include: { variants: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>): Promise<Product> {
    const created = await this.prismaWrite.product.create({
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
    const updated = await this.prismaWrite.product.update({
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
    await this.prismaWrite.product.delete({ where: { id } });
  }

  async createVariant(variant: Omit<ProductVariant, 'id' | 'createdAt'>): Promise<ProductVariant> {
    return await this.prismaWrite.productVariant.create({
      data: variant,
    });
  }

  async deleteVariant(variantId: number): Promise<void> {
    await this.prismaWrite.productVariant.delete({ where: { id: variantId } });
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