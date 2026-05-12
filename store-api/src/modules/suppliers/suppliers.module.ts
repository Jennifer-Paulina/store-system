import { Module } from '@nestjs/common';
import { SupplierController } from './application/controllers/supplier.controller';
import { SupplierLogic } from './application/logic/supplier.logic';
import { SupplierRepository } from './infrastructure/repositories/supplier.repository';
import { ISupplierRepository } from './domain/interfaces/supplier.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [SupplierController],
  providers: [
    PrismaService,
    SupplierLogic,
    {
      provide: ISupplierRepository,
      useClass: SupplierRepository,
    },
  ],
  exports: [SupplierLogic],
})
export class SuppliersModule {}