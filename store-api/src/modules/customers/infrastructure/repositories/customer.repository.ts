import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { ICustomerRepository } from '../../domain/interfaces/customer.repository.interface';
import { Customer, CustomerStatus } from '../../domain/entities/customer.entity';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<Customer[]> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.customer.findMany({
      orderBy: { name: 'asc' },
    }) as Customer[];
  }

  async findById(id: number): Promise<Customer | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.customer.findUnique({
      where: { id },
    }) as Customer | null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.customer.findUnique({
      where: { email },
    }) as Customer | null;
  }

  async findByAuthUserId(authUserId: number): Promise<Customer | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.customer.findUnique({
      where: { authUserId },
    }) as Customer | null;
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return await this.prismaWrite.customer.create({
      data: customer,
    }) as Customer;
  }

  async update(id: number, customer: Partial<Customer>): Promise<Customer> {
    return await this.prismaWrite.customer.update({
      where: { id },
      data: customer,
    }) as Customer;
  }

  async updateStatus(id: number, status: CustomerStatus): Promise<Customer> {
    return await this.prismaWrite.customer.update({
      where: { id },
      data: { status },
    }) as Customer;
  }

  async delete(id: number): Promise<void> {
    await this.prismaWrite.customer.delete({
      where: { id },
    });
  }
}