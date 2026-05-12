export enum CustomerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Customer {
  id: number;
  authUserId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface CreateCustomerRequest {
  authUserId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
}