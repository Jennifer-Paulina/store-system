export class CategoryNotFoundException extends Error {
  constructor(id: number) {
    super(`Categoría con ID ${id} no encontrada.`);
    this.name = 'CategoryNotFoundException';
  }
}

export class CategoryAlreadyExistsException extends Error {
  constructor(name: string) {
    super(`La categoría '${name}' ya existe.`);
    this.name = 'CategoryAlreadyExistsException';
  }
}