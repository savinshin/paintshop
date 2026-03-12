import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  // private readonly baseUrl = '/api/Products';
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Products`;

  getProducts(q?: string, page: number = 1, pageSize: number = 20): Observable<Product[]> {
    let params = new HttpParams();
    if (q && q.trim()) params = params.set('q', q.trim());
    if (page) params = params.set('page', String(page));
    if (pageSize) params = params.set('pageSize', String(pageSize));

    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  updateProduct(id: string, changes: Partial<Product>): Observable<Product> {
    const body = {
      id,
      sku: changes.sku ?? null,
      name: changes.name ?? null,
      brand: changes.brand ?? null,
      finish: changes.finish ?? null,
      packageMl: changes.packageMl ?? null,
      price: changes.price ?? null,
      currency: changes.currency ?? null,
      stockQty: changes.stockQty ?? null,
      hex: changes.hex ?? null,
      imageUrl: changes.imageUrl ?? null,
      categoryIds: changes.categoryIds ?? null,
    };

    return this.http.put<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`, body);
  }

  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }
}
