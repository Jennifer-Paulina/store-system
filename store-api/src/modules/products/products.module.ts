import { Module } from '@nestjs/common';
import { ProductController } from './application/controllers/product.controller';
import { ProductLogic } from './application/logic/product.logic';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { IProductRepository } from './domain/interfaces/product.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [ProductController],
  providers: [
    PrismaService,
    ProductLogic,
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductLogic],
})
export class ProductsModule {}