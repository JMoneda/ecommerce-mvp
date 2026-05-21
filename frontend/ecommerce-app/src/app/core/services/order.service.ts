import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order, OrderStatus } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getMyOrders() {
    return this.http.get<Order[]>(`${this.url}/my`);
  }

  getAllOrders(status?: OrderStatus) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(this.url, { params });
  }

  checkout() {
    return this.http.post<Order>(`${this.url}/checkout`, {});
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.http.put<Order>(`${this.url}/${id}/status`, { status });
  }

  delete(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
