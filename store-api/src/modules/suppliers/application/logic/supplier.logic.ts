import { Injectable, Inject } from '@nestjs/common';
import { ISupplierRepository } from '../../domain/interfaces/supplier.repository.interface';
import { Supplier } from '../../domain/entities/supplier.entity';
import { CreateSupplierDto } from '../../domain/dtos/create-supplier.dto';
import { UpdateSupplierDto } from '../../domain/dtos/update-supplier.dto';
import { SupplierNotFoundException } from '../../domain/exceptions/supplier.exceptions';

@Injectable()
export class SupplierLogic {
  constructor(
    @Inject(ISupplierRepository)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return await this.supplierRepository.findAll();
  }

  async findById(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new SupplierNotFoundException(id);
    return supplier;
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    return await this.supplierRepository.create({
      name: dto.name,
      contact: dto.contact ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      description: dto.description ?? null,
      isActive: true,
    });
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findById(id);
    return await this.supplierRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.supplierRepository.delete(id);
  }
}