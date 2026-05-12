export class OrderNotFoundException extends Error {
  constructor(id: number) {
    super(`Pedido con ID ${id} no encontrado.`);
    this.name = 'OrderNotFoundException';
  }
}

export class OrderNotPendingException extends Error {
  constructor(id: number) {
    super(`El pedido con ID ${id} no está en estado PENDING_REVIEW.`);
    this.name = 'OrderNotPendingException';
  }
}