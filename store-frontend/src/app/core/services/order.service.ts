import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.storeApiUrl;

  constructor(private http: HttpClient) {}

  getAll(customerId?: number): Observable<Order[]> {
    const url = customerId
      ? `${this.apiUrl}/orders?customerId=${customerId}`
      : `${this.apiUrl}/orders`;
    return this.http.get<Order[]>(url);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  create(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  confirm(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/confirm`, {});
  }

  reject(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/reject`, {});
  }

  downloadTicket(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${id}/ticket`, { responseType: 'blob' });
  }
}