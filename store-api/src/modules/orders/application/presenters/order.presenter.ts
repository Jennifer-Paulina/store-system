import { Order, OrderItem, OrderStatus } from '../../domain/entities/order.entity';

export class OrderItemPresenter {
  id: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;

  static from(item: OrderItem): OrderItemPresenter {
    const presenter = new OrderItemPresenter();
    presenter.id = item.id;
    presenter.productId = item.productId;
    presenter.variantId = item.variantId;
    presenter.quantity = item.quantity;
    presenter.unitPrice = item.unitPrice;
    presenter.subtotal = item.subtotal;
    return presenter;
  }
}

export class OrderPresenter {
  id: number;
  total: number;
  status: OrderStatus;
  notes?: string | null;
  customerId: number;
  items: OrderItemPresenter[];
  createdAt: Date;

  static from(order: Order): OrderPresenter {
    const presenter = new OrderPresenter();
    presenter.id = order.id;
    presenter.total = order.total;
    presenter.status = order.status;
    presenter.notes = order.notes;
    presenter.customerId = order.customerId;
    presenter.items = order.items?.map(OrderItemPresenter.from) ?? [];
    presenter.createdAt = order.createdAt;
    return presenter;
  }

  static fromMany(orders: Order[]): OrderPresenter[] {
    return orders.map((o) => OrderPresenter.from(o));
  }
}