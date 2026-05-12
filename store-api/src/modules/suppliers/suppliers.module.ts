import { Module } from '@nestjs/common';
import { SupplierController } from './application/controllers/supplier.controller';
import { SupplierLogic } from './application/logic/supplier.logic';
import { SupplierRepository } from './infrastructure/repositories/supplier.repository';
import { ISupplierRepository } from './domain/interfaces/supplier.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';

@Module({
  controllers: [SupplierController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
    SupplierLogic,
    {
      provide: ISupplierRepository,
      useClass: SupplierRepository,
    },
  ],
  exports: [SupplierLogic],
})
export class SuppliersModule {}