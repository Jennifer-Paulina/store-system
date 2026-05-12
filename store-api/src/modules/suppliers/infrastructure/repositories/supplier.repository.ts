import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { ISupplierRepository } from '../../domain/interfaces/supplier.repository.interface';
import { Supplier } from '../../domain/entities/supplier.entity';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<Supplier[]> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Supplier | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.supplier.findUnique({
      where: { id },
    });
  }

  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return await this.prismaWrite.supplier.create({
      data: supplier,
    });
  }

  async update(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    return await this.prismaWrite.supplier.update({
      where: { id },
      data: supplier,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prismaWrite.supplier.delete({
      where: { id },
    });
  }
}