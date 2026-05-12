import { InventoryItem, StockMovement, MovementType } from '../entities/inventory.entity';

export const IInventoryRepository = Symbol('IInventoryRepository');

export interface IInventoryRepository {
  findAll(): Promise<InventoryItem[]>;
  findById(id: number): Promise<InventoryItem | null>;
  findByProduct(productId: number): Promise<InventoryItem | null>;
  findByProductAndVariant(productId: number, variantId: number): Promise<InventoryItem | null>;
  create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'stockMovements'>): Promise<InventoryItem>;
  update(id: number, item: Partial<InventoryItem>): Promise<InventoryItem>;
  addMovement(inventoryItemId: number, quantity: number, type: MovementType, reference?: string): Promise<StockMovement>;
}