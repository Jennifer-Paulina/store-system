import { InventoryItem, MovementType } from '../../domain/entities/inventory.entity';

export class InventoryPresenter {
  id: number;
  productId: number;
  variantId?: number | null;
  stock: number;
  minStock: number;
  isLowStock: boolean;
  createdAt: Date;

  static from(item: InventoryItem): InventoryPresenter {
    const presenter = new InventoryPresenter();
    presenter.id = item.id;
    presenter.productId = item.productId;
    presenter.variantId = item.variantId;
    presenter.stock = item.stock;
    presenter.minStock = item.minStock;
    presenter.isLowStock = item.stock <= item.minStock;
    presenter.createdAt = item.createdAt;
    return presenter;
  }

  static fromMany(items: InventoryItem[]): InventoryPresenter[] {
    return items.map((i) => InventoryPresenter.from(i));
  }
}