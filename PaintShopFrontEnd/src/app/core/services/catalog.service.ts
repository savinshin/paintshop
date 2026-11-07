import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProductRequest, Product, UpdateProductRequest } from '../models/product.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  // private readonly baseUrl = '/api/Products';
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Products`;

  getProducts(q?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (q && q.trim()) params = params.set('q', q.trim());

    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  updateProduct(id: string, changes: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`, changes);
  }

  createProduct(payload: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }
}
