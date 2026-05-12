export class SupplierNotFoundException extends Error {
  constructor(id: number) {
    super(`Proveedor con ID ${id} no encontrado.`);
    this.name = 'SupplierNotFoundException';
  }
}