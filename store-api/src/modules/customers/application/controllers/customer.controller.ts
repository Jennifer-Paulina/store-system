import { Controller, Get, Post, Put, Delete, Patch, Param, Body, ParseIntPipe, UseGuards, Inject } from '@nestjs/common';
import { CustomerLogic } from '../logic/customer.logic';
import { CustomerPresenter } from '../presenters/customer.presenter';
import { CreateCustomerDto } from '../../domain/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../domain/dtos/update-customer.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerLogic: CustomerLogic) {}

  @Get()
  async findAll(): Promise<CustomerPresenter[]> {
    const customers = await this.customerLogic.findAll();
    return CustomerPresenter.fromMany(customers);
  }

  @Get('auth/:authUserId')
  async findByAuthUserId(@Param('authUserId', ParseIntPipe) authUserId: number): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.findByAuthUserId(authUserId);
    return CustomerPresenter.from(customer);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.findById(id);
    return CustomerPresenter.from(customer);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.create(dto);
    return CustomerPresenter.from(customer);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.update(id, dto);
    return CustomerPresenter.from(customer);
  }

  @Patch(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.approve(id);
    return CustomerPresenter.from(customer);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<CustomerPresenter> {
    const customer = await this.customerLogic.deactivate(id);
    return CustomerPresenter.from(customer);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.customerLogic.delete(id);
    return { message: 'Cliente eliminado correctamente.' };
  }

  @Get(':id/orders')
  async getOrders(@Param('id', ParseIntPipe) id: number): Promise<{ customerId: number; message: string }> {
    await this.customerLogic.findById(id);
    return { customerId: id, message: 'Use GET /orders?customerId=' + id };
  }
}