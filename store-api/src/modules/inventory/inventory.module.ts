import { Module } from '@nestjs/common';
import { InventoryController } from './application/controllers/inventory.controller';
import { InventoryLogic } from './application/logic/inventory.logic';
import { InventoryRepository } from './infrastructure/repositories/inventory.repository';
import { IInventoryRepository } from './domain/interfaces/inventory.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [InventoryController],
  providers: [
    PrismaService,
    InventoryLogic,
    {
      provide: IInventoryRepository,
      useClass: InventoryRepository,
    },
  ],
  exports: [InventoryLogic],
})
export class InventoryModule {}