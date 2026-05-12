import { Module } from '@nestjs/common';
import { ProductController } from './application/controllers/product.controller';
import { ProductLogic } from './application/logic/product.logic';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { IProductRepository } from './domain/interfaces/product.repository.interface';
import { PrismaWriteService } from '../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../infrastructure/database/prisma-read.service';

@Module({
  controllers: [ProductController],
  providers: [
    PrismaWriteService,
    PrismaReadService,
    ProductLogic,
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductLogic],
})
export class ProductsModule {}