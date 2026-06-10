import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SupplierLogic } from '../logic/supplier.logic';
import { SupplierPresenter } from '../presenters/supplier.presenter';
import { CreateSupplierDto } from '../../domain/dtos/create-supplier.dto';
import { UpdateSupplierDto } from '../../domain/dtos/update-supplier.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierLogic: SupplierLogic) {}

  @Get()
  async findAll(): Promise<SupplierPresenter[]> {
    const suppliers = await this.supplierLogic.findAll();
    return SupplierPresenter.fromMany(suppliers);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<SupplierPresenter> {
    const supplier = await this.supplierLogic.findById(id);
    return SupplierPresenter.from(supplier);
  }

  @Post()
  async create(@Body() dto: CreateSupplierDto): Promise<SupplierPresenter> {
    const supplier = await this.supplierLogic.create(dto);
    return SupplierPresenter.from(supplier);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierPresenter> {
    const supplier = await this.supplierLogic.update(id, dto);
    return SupplierPresenter.from(supplier);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.supplierLogic.delete(id);
    return { message: 'Proveedor eliminado correctamente.' };
  }
}