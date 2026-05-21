import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateProductRequest, Product, ProductFilters } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(filters?: ProductFilters) {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.description) params = params.set('description', filters.description);
    if (filters?.code) params = params.set('code', filters.code);
    if (filters?.size) params = params.set('size', filters.size.toString());
    if (filters?.color) params = params.set('color', filters.color);
    return this.http.get<Product[]>(this.url, { params });
  }

  getById(id: string) {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(req: CreateProductRequest) {
    return this.http.post<Product>(this.url, req);
  }

  update(id: string, req: Partial<CreateProductRequest>) {
    return this.http.put<Product>(`${this.url}/${id}`, req);
  }

  delete(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
