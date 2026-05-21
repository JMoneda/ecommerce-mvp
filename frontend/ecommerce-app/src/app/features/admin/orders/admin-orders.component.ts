import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="header">
        <h1>Gestión de Órdenes</h1>
        <select [formControl]="statusFilter" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="InProcess">En Proceso</option>
          <option value="Paid">Pagado</option>
          <option value="Shipped">Enviado</option>
          <option value="Delivered">Entregado</option>
        </select>
      </div>

      @if (loading()) { <div class="loading">Cargando...</div> }
      @else if (orders().length === 0) { <div class="empty">No hay órdenes</div> }
      @else {
        <table class="table" [formGroup]="statusForm">
          <thead>
            <tr><th>Número</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>{{ order.orderNumber }}</td>
                <td>{{ order.customerName ?? '-' }}</td>
                <td>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</td>
                <td>
                  <select [formControlName]="order.id" class="status-select">
                    <option value="InProcess">En Proceso</option>
                    <option value="Paid">Pagado</option>
                    <option value="Shipped">Enviado</option>
                    <option value="Delivered">Entregado</option>
                  </select>
                </td>
                <td>{{ order.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button (click)="delete(order.id)" class="btn-delete">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    h1 { color:#1a1a2e; }
    .filter-select { padding:.6rem; border:1px solid #ddd; border-radius:4px; min-width:180px; }
    .loading,.empty { text-align:center; padding:3rem; color:#888; }
    .table { width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.08); }
    th { background:#1a1a2e; color:#fff; padding:.8rem 1rem; text-align:left; }
    td { padding:.8rem 1rem; border-bottom:1px solid #eee; }
    tr:hover td { background:#f9f9f9; }
    .status-select { padding:.4rem; border:1px solid #ddd; border-radius:4px; }
    .btn-delete { background:#e94560; color:#fff; border:none; padding:.4rem .8rem; border-radius:4px; cursor:pointer; }
  `]
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
