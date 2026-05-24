import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  /** Filtro de estado (formulario reactivo). */
  statusFilter = new FormControl<string>('', { nonNullable: true });

  /** Un FormControl reactivo por orden para cambiar su estado en la tabla. */
  statusForm = new FormRecord<FormControl<OrderStatus>>({});

  ngOnInit() {
    this.statusFilter.valueChanges.subscribe(() => this.loadOrders());
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    const status = this.statusFilter.value as OrderStatus || undefined;
    this.orderService.getAllOrders(status).subscribe({
      next: o => {
        this.orders.set(o);
        this.buildStatusControls(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildStatusControls(orders: Order[]) {
    Object.keys(this.statusForm.controls).forEach(k => this.statusForm.removeControl(k));
    for (const order of orders) {
      const control = new FormControl<OrderStatus>(order.status, { nonNullable: true });
      control.valueChanges.subscribe(status => this.updateStatus(order.id, status));
      this.statusForm.addControl(order.id, control);
    }
  }

  updateStatus(id: string, status: OrderStatus) {
    this.orderService.updateStatus(id, status).subscribe(() => this.loadOrders());
  }

  delete(id: string) {
    if (!confirm('¿Eliminar esta orden?')) return;
    this.orderService.delete(id).subscribe(() => this.loadOrders());
  }
}
