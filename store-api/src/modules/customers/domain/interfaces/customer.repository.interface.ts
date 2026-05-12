import { Customer, CustomerStatus } from '../entities/customer.entity';

export const ICustomerRepository = Symbol('ICustomerRepository');

export interface ICustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: number): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByAuthUserId(authUserId: number): Promise<Customer | null>;
  create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer>;
  update(id: number, customer: Partial<Customer>): Promise<Customer>;
  updateStatus(id: number, status: CustomerStatus): Promise<Customer>;
  delete(id: number): Promise<void>;
}