import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { IOrderRepository } from '../../domain/interfaces/order.repository.interface';
import { Order, OrderItem, OrderStatus } from '../../domain/entities/order.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<Order[]> {
    this.prismaRead.checkAvailability();
    const orders = await this.prismaRead.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(this.mapOrder);
  }

  async findById(id: number): Promise<Order | null> {
    this.prismaRead.checkAvailability();
    const order = await this.prismaRead.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? this.mapOrder(order) : null;
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
    this.prismaRead.checkAvailability();
    const orders = await this.prismaRead.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(this.mapOrder);
  }

  async create(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
    items: Omit<OrderItem, 'id' | 'orderId'>[],
  ): Promise<Order> {
    const created = await this.prismaWrite.order.create({
      data: {
        total: order.total,
        status: order.status,
        notes: order.notes,
        customerId: order.customerId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });
    return this.mapOrder(created);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const updated = await this.prismaWrite.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return this.mapOrder(updated);
  }

  private mapOrder(order: any): Order {
    return {
      id: order.id,
      total: Number(order.total),
      status: order.status as OrderStatus,
      notes: order.notes,
      customerId: order.customerId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        orderId: item.orderId,
        productId: item.productId,
        variantId: item.variantId,
      })),
    };
  }
}