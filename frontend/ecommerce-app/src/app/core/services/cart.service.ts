import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Cart } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly url = `${environment.apiUrl}/cart`;
  private _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.items.reduce((acc, i) => acc + i.quantity, 0) ?? 0);
  readonly total = computed(() => this._cart()?.total ?? 0);

  constructor(private http: HttpClient) {}

  loadCart() {
    return this.http.get<Cart>(this.url).pipe(tap(c => this._cart.set(c)));
  }

  addItem(productId: string, quantity: number) {
    return this.http.post<Cart>(`${this.url}/items`, { productId, quantity }).pipe(
      tap(c => this._cart.set(c))
    );
  }

  updateItem(productId: string, quantity: number) {
    return this.http.put<Cart>(`${this.url}/items/${productId}`, { quantity }).pipe(
      tap(c => this._cart.set(c))
    );
  }

  removeItem(productId: string) {
    return this.http.delete<Cart>(`${this.url}/items/${productId}`).pipe(
      tap(c => this._cart.set(c))
    );
  }

  clearLocal() {
    this._cart.set(null);
  }
}
