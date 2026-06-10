import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductLogic } from '../logic/product.logic';
import { ProductPresenter } from '../presenters/product.presenter';
import { CreateProductDto } from '../../domain/dtos/create-product.dto';
import { UpdateProductDto } from '../../domain/dtos/update-product.dto';
import { CreateVariantDto } from '../../domain/dtos/create-variant.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productLogic: ProductLogic) {}

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
  ): Promise<ProductPresenter[]> {
    let products = await this.productLogic.findAll();
    if (categoryId) {
      products = await this.productLogic.findByCategory(Number(categoryId));
    }
    if (supplierId) {
      products = products.filter(p => p.supplierId === Number(supplierId));
    }
    return ProductPresenter.fromMany(products);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProductPresenter> {
    const product = await this.productLogic.findById(id);
    return ProductPresenter.from(product);
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductPresenter> {
    const product = await this.productLogic.create(dto);
    return ProductPresenter.from(product);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductPresenter> {
    const product = await this.productLogic.update(id, dto);
    return ProductPresenter.from(product);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.productLogic.delete(id);
    return { message: 'Producto eliminado correctamente.' };
  }

  @Post(':id/variants')
  async addVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateVariantDto,
  ): Promise<{ message: string }> {
    await this.productLogic.addVariant(id, dto);
    return { message: 'Variante agregada correctamente.' };
  }

  @Delete(':id/variants/:variantId')
  async removeVariant(
    @Param('id', ParseIntPipe) id: number,
    @Param('variantId', ParseIntPipe) variantId: number,
  ): Promise<{ message: string }> {
    await this.productLogic.removeVariant(id, variantId);
    return { message: 'Variante eliminada correctamente.' };
  }

  @Get(':id/variants')
  async getVariants(@Param('id', ParseIntPipe) id: number): Promise<ProductPresenter> {
    const product = await this.productLogic.findById(id);
    return ProductPresenter.from(product);
  }
}