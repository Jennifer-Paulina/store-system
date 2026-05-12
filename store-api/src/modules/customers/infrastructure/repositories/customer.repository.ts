import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ICustomerRepository } from '../../domain/interfaces/customer.repository.interface';
import { Customer, CustomerStatus } from '../../domain/entities/customer.entity';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Customer[]> {
    return await this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }) as Customer[];
  }

  async findById(id: number): Promise<Customer | null> {
    return await this.prisma.customer.findUnique({
      where: { id },
    }) as Customer | null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.prisma.customer.findUnique({
      where: { email },
    }) as Customer | null;
  }

  async findByAuthUserId(authUserId: number): Promise<Customer | null> {
    return await this.prisma.customer.findUnique({
      where: { authUserId },
    }) as Customer | null;
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return await this.prisma.customer.create({
      data: customer,
    }) as Customer;
  }

  async update(id: number, customer: Partial<Customer>): Promise<Customer> {
    return await this.prisma.customer.update({
      where: { id },
      data: customer,
    }) as Customer;
  }

  async updateStatus(id: number, status: CustomerStatus): Promise<Customer> {
    return await this.prisma.customer.update({
      where: { id },
      data: { status },
    }) as Customer;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}