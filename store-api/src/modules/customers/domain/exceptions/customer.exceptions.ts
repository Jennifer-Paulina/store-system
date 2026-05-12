export class CustomerNotFoundException extends Error {
  constructor(id: number) {
    super(`Cliente con ID ${id} no encontrado.`);
    this.name = 'CustomerNotFoundException';
  }
}

export class CustomerAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`El cliente con email '${email}' ya existe.`);
    this.name = 'CustomerAlreadyExistsException';
  }
}

export class CustomerNotActiveException extends Error {
  constructor(id: number) {
    super(`El cliente con ID ${id} no está activo.`);
    this.name = 'CustomerNotActiveException';
  }
}