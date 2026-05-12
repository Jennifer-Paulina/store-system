import { Customer, CustomerStatus } from '../../domain/entities/customer.entity';

export class CustomerPresenter {
  id: number;
  authUserId: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: CustomerStatus;
  createdAt: Date;

  static from(customer: Customer): CustomerPresenter {
    const presenter = new CustomerPresenter();
    presenter.id = customer.id;
    presenter.authUserId = customer.authUserId;
    presenter.name = customer.name;
    presenter.email = customer.email;
    presenter.phone = customer.phone;
    presenter.address = customer.address;
    presenter.status = customer.status;
    presenter.createdAt = customer.createdAt;
    return presenter;
  }

  static fromMany(customers: Customer[]): CustomerPresenter[] {
    return customers.map((c) => CustomerPresenter.from(c));
  }
}