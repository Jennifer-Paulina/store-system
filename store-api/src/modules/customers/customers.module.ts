import { Module } from '@nestjs/common';
import { CustomerController } from './application/controllers/customer.controller';
import { CustomerLogic } from './application/logic/customer.logic';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { ICustomerRepository } from './domain/interfaces/customer.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaService,
    CustomerLogic,
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomerLogic],
})
export class CustomersModule {}