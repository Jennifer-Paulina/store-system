export class ProductVariant {
  id: number;
  name: string;
  value: string;
  productId: number;
  createdAt: Date;
}

export class Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  categoryId: number;
  supplierId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  variants?: ProductVariant[];
}