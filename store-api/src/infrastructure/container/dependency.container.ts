import { Provider } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// ─── Repositories ─────────────────────────────────────────────

// Products
import { ProductRepository } from '../../modules/products/infrastructure/repositories/product.repository';
import { IProductRepository } from '../../modules/products/domain/interfaces/product.repository.interface';

// Categories
import { CategoryRepository } from '../../modules/categories/infrastructure/repositories/category.repository';
import { ICategoryRepository } from '../../modules/categories/domain/interfaces/category.repository.interface';

// Suppliers
import { SupplierRepository } from '../../modules/suppliers/infrastructure/repositories/supplier.repository';
import { ISupplierRepository } from '../../modules/suppliers/domain/interfaces/supplier.repository.interface';

// Customers
import { CustomerRepository } from '../../modules/customers/infrastructure/repositories/customer.repository';
import { ICustomerRepository } from '../../modules/customers/domain/interfaces/customer.repository.interface';

// Inventory
import { InventoryRepository } from '../../modules/inventory/infrastructure/repositories/inventory.repository';
import { IInventoryRepository } from '../../modules/inventory/domain/interfaces/inventory.repository.interface';

// Orders
import { OrderRepository } from '../../modules/orders/infrastructure/repositories/order.repository';
import { IOrderRepository } from '../../modules/orders/domain/interfaces/order.repository.interface';

export const DatabaseProviders: Provider[] = [
  PrismaService,
  {
    provide: IProductRepository,
    useClass: ProductRepository,
  },
  {
    provide: ICategoryRepository,
    useClass: CategoryRepository,
  },
  {
    provide: ISupplierRepository,
    useClass: SupplierRepository,
  },
  {
    provide: ICustomerRepository,
    useClass: CustomerRepository,
  },
  {
    provide: IInventoryRepository,
    useClass: InventoryRepository,
  },
  {
    provide: IOrderRepository,
    useClass: OrderRepository,
  },
];