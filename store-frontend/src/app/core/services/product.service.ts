import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.storeApiUrl;

  constructor(private http: HttpClient) {}

  getAll(categoryId?: number, supplierId?: number): Observable<Product[]> {
    let url = `${this.apiUrl}/products`;
    const params: string[] = [];
    if (categoryId) params.push(`categoryId=${categoryId}`);
    if (supplierId) params.push(`supplierId=${supplierId}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<Product[]>(url);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  create(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  update(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  addVariant(productId: number, variant: { name: string; value: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products/${productId}/variants`, variant);
  }

  deleteVariant(productId: number, variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}/variants/${variantId}`);
  }
}