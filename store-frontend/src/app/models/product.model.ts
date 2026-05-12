export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  categoryId: number;
  supplierId?: number;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  supplierId?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
}