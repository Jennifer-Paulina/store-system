import { Module } from '@nestjs/common';
import { InventoryController } from './application/controllers/inventory.controller';
import { InventoryLogic } from './application/logic/inventory.logic';
import { InventoryRepository } from './infrastructure/repositories/inventory.repository';
import { IInventoryRepository } from './domain/interfaces/inventory.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';

@Module({
  controllers: [InventoryController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
    InventoryLogic,
    {
      provide: IInventoryRepository,
      useClass: InventoryRepository,
    },
  ],
  exports: [InventoryLogic],
})
export class InventoryModule {}