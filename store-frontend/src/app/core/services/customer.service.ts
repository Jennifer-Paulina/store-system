import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = environment.storeApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
  }

  getByAuthUserId(authUserId: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/auth/${authUserId}`);
  }

  create(customer: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
  }

  update(id: number, customer: UpdateCustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customer);
  }

  approve(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/approve`, {});
  }

  deactivate(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/deactivate`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }
}