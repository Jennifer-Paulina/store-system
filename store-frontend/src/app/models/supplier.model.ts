export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive?: boolean;
}