import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>Mis Pedidos</h1>
      @if (loading()) { <div class="loading">Cargando...</div> }
      @else if (orders().length === 0) { <div class="empty">No tienes pedidos aún</div> }
      @else {
        @for (order of orders(); track order.id) {
          <div class="order-card">
            <div class="order-header">
              <div>
                <span class="order-num">{{ order.orderNumber }}</span>
                <span class="date">{{ order.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <span class="status" [class]="'status-' + order.status.toLowerCase()">{{ statusLabel(order.status) }}</span>
            </div>
            <div class="order-items">
              @for (item of order.items; track item.productId) {
                <div class="item-row">
                  <span>{{ item.productName }}</span>
                  <span>x{{ item.quantity }}</span>
                  <span>{{ item.subtotal | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
              }
            </div>
            <div class="order-total">Total: <strong>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</strong></div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    h1 { color:#1a1a2e; margin-bottom:1.5rem; }
    .loading,.empty { text-align:center; padding:3rem; color:#888; }
    .order-card { background:#fff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,.08); margin-bottom:1.5rem; overflow:hidden; }
    .order-header { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:#f9f9f9; border-bottom:1px solid #eee; }
    .order-num { font-weight:700; color:#1a1a2e; margin-right:.8rem; }
    .date { color:#888; font-size:.85rem; }
    .status { padding:.3rem .8rem; border-radius:20px; font-size:.85rem; font-weight:600; }
    .status-inprocess { background:#fff3cd; color:#856404; }
    .status-paid { background:#d4edda; color:#155724; }
    .status-shipped { background:#cce5ff; color:#004085; }
    .status-delivered { background:#d1ecf1; color:#0c5460; }
    .order-items { padding:1rem 1.5rem; }
    .item-row { display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid #f5f5f5; color:#555; }
    .order-total { padding:1rem 1.5rem; text-align:right; font-size:1.1rem; border-top:1px solid #eee; }
  `]
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(s: string) {
    return { InProcess: 'En Proceso', Paid: 'Pagado', Shipped: 'Enviado', Delivered: 'Entregado' }[s] ?? s;
  }
}
