import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/interfaces/order.repository.interface';
import { CreateOrderDto } from '../../domain/dtos/create-order.dto';
import { OrderNotFoundException, OrderNotPendingException } from '../../domain/exceptions/order.exceptions';
import { ProductLogic } from '../../../products/application/logic/product.logic';
import { InventoryLogic } from '../../../inventory/application/logic/inventory.logic';
import { Order, OrderItem, OrderStatus } from '../../domain/entities/order.entity';
import { TicketService } from '../../infrastructure/services/ticket.service';
import { ProductNotActiveException } from '../../../products/domain/exceptions/product.exceptions';
import { CustomerLogic } from '../../../customers/application/logic/customer.logic';
import { CustomerNotActiveException } from '../../../customers/domain/exceptions/customer.exceptions';

@Injectable()
export class OrderLogic {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    private readonly productLogic: ProductLogic,
    private readonly inventoryLogic: InventoryLogic,
    private readonly ticketService: TicketService,
    private readonly customerLogic: CustomerLogic,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.findAll();
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new OrderNotFoundException(id);
    return order;
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
    return await this.orderRepository.findByCustomer(customerId);
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const customer = await this.customerLogic.findById(dto.customerId);
      if (customer.status !== 'ACTIVE')
        throw new CustomerNotActiveException(dto.customerId);

    let total = 0;
    const items: Omit<OrderItem, 'id' | 'orderId'>[] = [];

    for (const item of dto.items) {
      const product = await this.productLogic.findById(item.productId);

      if (!product.isActive)
        throw new ProductNotActiveException(item.productId);

      const subtotal = product.price * item.quantity;
      total += subtotal;
      items.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    return await this.orderRepository.create(
      {
        total,
        status: OrderStatus.PENDING_REVIEW,
        notes: dto.notes ?? null,
        customerId: dto.customerId,
      },
      items,
    );
  }

  async confirm(id: number): Promise<Order> {
  const order = await this.findById(id);
  if (order.status !== OrderStatus.PENDING_REVIEW)
    throw new OrderNotPendingException(id);

  try {
    for (const item of order.items ?? []) {
      await this.inventoryLogic.reduceStock(
        item.productId,
        item.quantity,
        item.variantId ?? undefined,
      );
    }
    const confirmed = await this.orderRepository.updateStatus(id, OrderStatus.CONFIRMED);

    // Obtener nombres de productos para el ticket
    const productNames: Record<number, string> = {};
    for (const item of confirmed.items ?? []) {
      try {
        const product = await this.productLogic.findById(item.productId);
        productNames[item.productId] = product.name;
      } catch {
        productNames[item.productId] = `Producto #${item.productId}`;
      }
    }

    try {
      await this.ticketService.generateTicket(confirmed, productNames);
    } catch {
      // El ticket falló pero el pedido ya fue confirmado exitosamente
    }
    return confirmed;
  } catch (error) {
    await this.orderRepository.updateStatus(id, OrderStatus.CONFIRMATION_FAILED_STOCK);
    throw error;
  }
}
  async reject(id: number): Promise<Order> {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.PENDING_REVIEW)
      throw new OrderNotPendingException(id);
    return await this.orderRepository.updateStatus(id, OrderStatus.REJECTED);
  }
}