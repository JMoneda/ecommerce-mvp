import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  readonly steps = ['InProcess', 'Paid', 'Shipped', 'Delivered'] as const;

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(s: string) {
    return { InProcess: 'En proceso', Paid: 'Pagado', Shipped: 'Enviado', Delivered: 'Entregado' }[s] ?? s;
  }
  statusIcon(s: string) {
    return { InProcess: '⏳', Paid: '💵', Shipped: '🚚', Delivered: '✓' }[s] ?? '';
  }
  badgeClass(s: string) {
    return { InProcess: 'badge-warn', Paid: 'badge-info', Shipped: 'badge-info', Delivered: 'badge-success' }[s] ?? '';
  }
  private stepIndex(s: string) { return this.steps.indexOf(s as any); }
  stepDone(current: string, step: string) { return this.stepIndex(step) < this.stepIndex(current); }
  stepCurrent(current: string, step: string) { return current === step; }
}
