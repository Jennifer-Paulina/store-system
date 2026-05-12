export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class StockMovement {
  id: number;
  quantity: number;
  type: MovementType;
  reference?: string | null;
  createdAt: Date;
  inventoryItemId: number;
}

export class InventoryItem {
  id: number;
  stock: number;
  minStock: number;
  productId: number;
  variantId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  stockMovements?: StockMovement[];
}