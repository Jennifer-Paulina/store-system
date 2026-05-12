export enum CustomerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class Customer {
  id: number;
  authUserId: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}