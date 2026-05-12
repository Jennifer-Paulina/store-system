import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/interfaces/customer.repository.interface';
import { Customer, CustomerStatus } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../../domain/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../domain/dtos/update-customer.dto';
import {
  CustomerNotFoundException,
  CustomerAlreadyExistsException,
} from '../../domain/exceptions/customer.exceptions';

@Injectable()
export class CustomerLogic {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.findAll();
  }

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new CustomerNotFoundException(id);
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const exists = await this.customerRepository.findByEmail(dto.email);
    if (exists) throw new CustomerAlreadyExistsException(dto.email);

    return await this.customerRepository.create({
      authUserId: dto.authUserId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      status: CustomerStatus.PENDING,
    });
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findById(id);
    return await this.customerRepository.update(id, dto);
  }

  async approve(id: number): Promise<Customer> {
    await this.findById(id);
    return await this.customerRepository.updateStatus(id, CustomerStatus.ACTIVE);
  }

  async deactivate(id: number): Promise<Customer> {
    await this.findById(id);
    return await this.customerRepository.updateStatus(id, CustomerStatus.INACTIVE);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.customerRepository.delete(id);
  }

  async findByAuthUserId(authUserId: number): Promise<Customer> {
    const customer = await this.customerRepository.findByAuthUserId(authUserId);
    if (!customer) throw new CustomerNotFoundException(authUserId);
    return customer;
  }
}