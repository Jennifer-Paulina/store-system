export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface InventoryItem {
  id: number;
  productId: number;
  variantId?: number;
  stock: number;
  minStock: number;
  isLowStock: boolean;
  createdAt: string;
}

export interface AdjustStockRequest {
  quantity: number;
  type: MovementType;
  reference?: string;
}