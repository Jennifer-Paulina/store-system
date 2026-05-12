import { Order, OrderItem, OrderStatus } from '../entities/order.entity';

export const IOrderRepository = Symbol('IOrderRepository');

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  findByCustomer(customerId: number): Promise<Order[]>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order>;
  updateStatus(id: number, status: OrderStatus): Promise<Order>;
}