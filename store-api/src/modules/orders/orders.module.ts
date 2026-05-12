import { Module } from '@nestjs/common';
import { OrderController } from './application/controllers/order.controller';
import { OrderLogic } from './application/logic/order.logic';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { TicketRepository } from './infrastructure/repositories/ticket.repository';
import { IOrderRepository } from './domain/interfaces/order.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CustomersModule } from '../customers/customers.module';
import { TicketService } from './infrastructure/services/ticket.service';

@Module({
  imports: [ProductsModule, InventoryModule, CustomersModule],
  controllers: [OrderController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
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