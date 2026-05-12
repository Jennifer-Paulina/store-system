import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryItem, AdjustStockRequest } from '../../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = environment.storeApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`);
  }

  getById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/inventory/${id}`);
  }

  getByProduct(productId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/inventory/product/${productId}`);
  }

  create(data: { productId: number; stock: number; minStock: number }): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/inventory`, data);
  }

  adjustStock(id: number, request: AdjustStockRequest): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/inventory/${id}/adjust`, request);
  }

  updateMinStock(id: number, minStock: number): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/inventory/${id}/min-stock`, { minStock });
  }
}