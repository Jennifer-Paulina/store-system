import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query, Res, NotFoundException, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { OrderLogic } from '../logic/order.logic';
import { OrderPresenter } from '../presenters/order.presenter';
import { CreateOrderDto } from '../../domain/dtos/create-order.dto';
import { TicketService } from '../../infrastructure/services/ticket.service';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderLogic: OrderLogic,
    private readonly ticketService: TicketService,
  ) {}

  @Get()
  async findAll(@Query('customerId') customerId?: string): Promise<OrderPresenter[]> {
    if (customerId) {
      const orders = await this.orderLogic.findByCustomer(Number(customerId));
      return OrderPresenter.fromMany(orders);
    }
    const orders = await this.orderLogic.findAll();
    return OrderPresenter.fromMany(orders);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<OrderPresenter> {
    const order = await this.orderLogic.findById(id);
    return OrderPresenter.from(order);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<OrderPresenter> {
    const order = await this.orderLogic.create(dto);
    return OrderPresenter.from(order);
  }

  @Patch(':id/confirm')
  async confirm(@Param('id', ParseIntPipe) id: number): Promise<OrderPresenter> {
    const order = await this.orderLogic.confirm(id);
    return OrderPresenter.from(order);
  }

  @Patch(':id/reject')
  async reject(@Param('id', ParseIntPipe) id: number): Promise<OrderPresenter> {
    const order = await this.orderLogic.reject(id);
    return OrderPresenter.from(order);
  }

  @Get(':id/ticket')
  async downloadTicket(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = await this.ticketService.getTicketPath(id);
    if (!filePath) throw new NotFoundException('Ticket no encontrado para este pedido.');
    res.download(filePath);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No se proporcionó ningún archivo.');
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten PDF, JPG y PNG.`);
    }

    return {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      message: 'Archivo subido correctamente'
    };
  }
}