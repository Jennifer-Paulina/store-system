export class ProductNotFoundException extends Error {
  constructor(id: number) {
    super(`Producto con ID ${id} no encontrado.`);
    this.name = 'ProductNotFoundException';
  }
}

export class ProductNotActiveException extends Error {
  constructor(id: number) {
    super(`El producto con ID ${id} no está activo.`);
    this.name = 'ProductNotActiveException';
  }
}

export class ProductVariantNotFoundException extends Error {
  constructor(id: number) {
    super(`Variante con ID ${id} no encontrada.`);
    this.name = 'ProductVariantNotFoundException';
  }
}