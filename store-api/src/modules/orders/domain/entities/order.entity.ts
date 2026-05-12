export enum OrderStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CONFIRMATION_FAILED_STOCK = 'CONFIRMATION_FAILED_STOCK',
}

export class OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  orderId: number;
  productId: number;
  variantId?: number | null;
}

export class Order {
  id: number;
  total: number;
  status: OrderStatus;
  notes?: string | null;
  customerId: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}