import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { ICategoryRepository } from '../../domain/interfaces/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<Category[]> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Category | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.category.findUnique({
      where: { name },
    });
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return await this.prismaWrite.category.create({
      data: category,
    });
  }

  async update(id: number, category: Partial<Category>): Promise<Category> {
    return await this.prismaWrite.category.update({
      where: { id },
      data: category,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prismaWrite.category.delete({
      where: { id },
    });
  }
}