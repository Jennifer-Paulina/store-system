import { Supplier } from '../entities/supplier.entity';

export const ISupplierRepository = Symbol('ISupplierRepository');

export interface ISupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: number): Promise<Supplier | null>;
  create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;
  update(id: number, supplier: Partial<Supplier>): Promise<Supplier>;
  delete(id: number): Promise<void>;
}