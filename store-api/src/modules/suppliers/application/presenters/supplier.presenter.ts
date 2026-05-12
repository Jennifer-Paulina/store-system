import { Supplier } from '../../domain/entities/supplier.entity';

export class SupplierPresenter {
  id: number;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;

  static from(supplier: Supplier): SupplierPresenter {
    const presenter = new SupplierPresenter();
    presenter.id = supplier.id;
    presenter.name = supplier.name;
    presenter.contact = supplier.contact;
    presenter.phone = supplier.phone;
    presenter.email = supplier.email;
    presenter.description = supplier.description;
    presenter.isActive = supplier.isActive;
    presenter.createdAt = supplier.createdAt;
    return presenter;
  }

  static fromMany(suppliers: Supplier[]): SupplierPresenter[] {
    return suppliers.map((s) => SupplierPresenter.from(s));
  }
}