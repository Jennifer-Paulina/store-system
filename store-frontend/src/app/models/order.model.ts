export enum OrderStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CONFIRMATION_FAILED_STOCK = 'CONFIRMATION_FAILED_STOCK'
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  customerId: number;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderRequest {
  customerId: number;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}