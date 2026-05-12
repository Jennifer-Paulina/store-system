import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/interfaces/product.repository.interface';
import { Product, ProductVariant } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../domain/dtos/create-product.dto';
import { UpdateProductDto } from '../../domain/dtos/update-product.dto';
import { CreateVariantDto } from '../../domain/dtos/create-variant.dto';
import { ProductNotFoundException, ProductNotActiveException, ProductVariantNotFoundException } from '../../domain/exceptions/product.exceptions';

@Injectable()
export class ProductLogic {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);
    return product;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return await this.productRepository.findByCategory(categoryId);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return await this.productRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      isActive: true,
      categoryId: dto.categoryId,
      supplierId: dto.supplierId ?? null,
    });
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    await this.findById(id);
    return await this.productRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.productRepository.delete(id);
  }

  async addVariant(productId: number, dto: CreateVariantDto): Promise<ProductVariant> {
    await this.findById(productId);
    return await this.productRepository.createVariant({
      name: dto.name,
      value: dto.value,
      productId,
    });
  }

  async removeVariant(productId: number, variantId: number): Promise<void> {
  const product = await this.findById(productId);
  const variant = product.variants?.find(v => v.id === variantId);
  if (!variant) throw new ProductVariantNotFoundException(variantId);
    await this.productRepository.deleteVariant(variantId);
  }
}