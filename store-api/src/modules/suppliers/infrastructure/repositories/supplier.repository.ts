import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ISupplierRepository } from '../../domain/interfaces/supplier.repository.interface';
import { Supplier } from '../../domain/entities/supplier.entity';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Supplier[]> {
    return await this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return await this.prisma.supplier.create({
      data: supplier,
    });
  }

  async update(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    return await this.prisma.supplier.update({
      where: { id },
      data: supplier,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id },
    });
  }
}