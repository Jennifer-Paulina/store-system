export class InventoryItemNotFoundException extends Error {
  constructor(id: number) {
    super(`Item de inventario con ID ${id} no encontrado.`);
    this.name = 'InventoryItemNotFoundException';
  }
}

export class InsufficientStockException extends Error {
  constructor(productId: number, available: number, requested: number) {
    super(`Stock insuficiente para producto ID ${productId}. Disponible: ${available}, solicitado: ${requested}.`);
    this.name = 'InsufficientStockException';
  }
}