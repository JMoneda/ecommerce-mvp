import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  checkingOut = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  ngOnInit() { this.cartService.loadCart().subscribe(); }

  updateQty(productId: string, qty: number) {
    if (qty < 1) return;
    this.cartService.updateItem(productId, qty).subscribe();
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId).subscribe();
  }

  checkout() {
    this.checkingOut.set(true);
    this.errorMsg.set('');
    this.orderService.checkout().subscribe({
      next: order => {
        this.cartService.clearLocal();
        this.successMsg.set(`¡Pedido ${order.orderNumber} creado! Redirigiendo…`);
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: err => {
        this.errorMsg.set(err.error?.error ?? 'Error al procesar el pedido');
        this.checkingOut.set(false);
      }
    });
  }
}
