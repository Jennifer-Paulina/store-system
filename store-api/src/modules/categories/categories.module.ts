import { Module } from '@nestjs/common';
import { CategoryController } from './application/controllers/category.controller';
import { CategoryLogic } from './application/logic/category.logic';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { ICategoryRepository } from './domain/interfaces/category.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';

@Module({
  controllers: [CategoryController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
    CategoryLogic,
    {
      provide: ICategoryRepository,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoryLogic],
})
export class CategoriesModule {}