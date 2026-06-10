import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventoryLogic } from '../logic/inventory.logic';
import { InventoryPresenter } from '../presenters/inventory.presenter';
import { CreateInventoryDto } from '../../domain/dtos/create-inventory.dto';
import { AdjustStockDto } from '../../domain/dtos/adjust-stock.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryLogic: InventoryLogic) {}

  @Get()
  async findAll(): Promise<InventoryPresenter[]> {
    const items = await this.inventoryLogic.findAll();
    return InventoryPresenter.fromMany(items);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<InventoryPresenter> {
    const item = await this.inventoryLogic.findById(id);
    return InventoryPresenter.from(item);
  }

  @Post()
  async create(@Body() dto: CreateInventoryDto): Promise<InventoryPresenter> {
    const item = await this.inventoryLogic.create(dto);
    return InventoryPresenter.from(item);
  }

  @Patch(':id/adjust')
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustStockDto,
  ): Promise<InventoryPresenter> {
    const item = await this.inventoryLogic.adjustStock(id, dto);
    return InventoryPresenter.from(item);
  }
  @Get('product/:productId')
  async findByProduct(@Param('productId', ParseIntPipe) productId: number): Promise<InventoryPresenter> {
    const item = await this.inventoryLogic.findByProduct(productId);
    return InventoryPresenter.from(item);
  }

  @Patch(':id/min-stock')
  async updateMinStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { minStock: number },
  ): Promise<InventoryPresenter> {
    const item = await this.inventoryLogic.updateMinStock(id, dto.minStock);
    return InventoryPresenter.from(item);
  }
}