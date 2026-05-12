import { Module } from '@nestjs/common';
import { CustomerController } from './application/controllers/customer.controller';
import { CustomerLogic } from './application/logic/customer.logic';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { ICustomerRepository } from './domain/interfaces/customer.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
    CustomerLogic,
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomerLogic],
})
export class CustomersModule {}