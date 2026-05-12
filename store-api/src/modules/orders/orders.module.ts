import { Module } from '@nestjs/common';
import { OrderController } from './application/controllers/order.controller';
import { OrderLogic } from './application/logic/order.logic';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { TicketRepository } from './infrastructure/repositories/ticket.repository';
import { IOrderRepository } from './domain/interfaces/order.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { TicketService } from './infrastructure/services/ticket.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [ProductsModule, InventoryModule, CustomersModule],
  controllers: [OrderController],
  providers: [
    PrismaService,
    OrderLogic,
    TicketService,
    TicketRepository,
    {
      provide: IOrderRepository,
      useClass: OrderRepository,
    },
  ],
  exports: [OrderLogic],
})
export class OrdersModule {}