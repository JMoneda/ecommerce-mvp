import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-container">
      <h1>Mi Carrito</h1>
      @if (cartService.cart()?.items?.length === 0 || !cartService.cart()) {
        <div class="empty">Tu carrito está vacío</div>
      } @else {
        <div class="cart-items">
          @for (item of cartService.cart()!.items; track item.id) {
            <div class="cart-item">
              <img [src]="item.imageUrl" [alt]="item.productName" class="item-img" onerror="this.src='/placeholder.jpg'">
              <div class="item-info">
                <h3>{{ item.productName }}</h3>
                <p>{{ item.unitPrice | currency:'COP':'symbol':'1.0-0' }} c/u</p>
              </div>
              <div class="item-qty">
                <button (click)="updateQty(item.productId, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="updateQty(item.productId, item.quantity + 1)">+</button>
              </div>
              <div class="item-subtotal">{{ item.subtotal | currency:'COP':'symbol':'1.0-0' }}</div>
              <button (click)="removeItem(item.productId)" class="btn-remove">✕</button>
            </div>
          }
        </div>
        <div class="cart-summary">
          <div class="total">Total: <strong>{{ cartService.total() | currency:'COP':'symbol':'1.0-0' }}</strong></div>
          <p class="note">🚚 Pago contra entrega</p>
          <button (click)="checkout()" class="btn-checkout" [disabled]="checkingOut">
            {{ checkingOut ? 'Procesando...' : 'Finalizar Compra' }}
          </button>
        </div>
      }
      @if (successMsg) { <p class="success">{{ successMsg }}</p> }
      @if (errorMsg) { <p class="error">{{ errorMsg }}</p> }
    </div>
  `,
  styles: [`
    .cart-container { max-width:800px; margin:0 auto; }
    h1 { color:#1a1a2e; margin-bottom:1.5rem; }
    .empty { text-align:center; padding:3rem; color:#888; font-size:1.1rem; }
    .cart-item { display:flex; align-items:center; gap:1rem; padding:1rem; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.08); margin-bottom:1rem; }
    .item-img { width:80px; height:80px; object-fit:cover; border-radius:4px; }
    .item-info { flex:1; }
    .item-info h3 { margin:0 0 .3rem; color:#1a1a2e; }
    .item-info p { color:#888; margin:0; }
    .item-qty { display:flex; align-items:center; gap:.5rem; }
    .item-qty button { width:28px; height:28px; border:1px solid #ddd; background:#f9f9f9; border-radius:4px; cursor:pointer; font-size:1rem; }
    .item-qty button:disabled { opacity:.4; cursor:not-allowed; }
    .item-subtotal { font-weight:700; color:#1a1a2e; min-width:100px; text-align:right; }
    .btn-remove { background:none; border:none; color:#e94560; font-size:1.2rem; cursor:pointer; }
    .cart-summary { background:#fff; padding:1.5rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.08); margin-top:1.5rem; text-align:right; }
    .total { font-size:1.3rem; margin-bottom:.5rem; }
    .note { color:#888; font-size:.9rem; margin:.5rem 0 1rem; }
    .btn-checkout { padding:.9rem 2rem; background:#e94560; color:#fff; border:none; border-radius:4px; font-size:1rem; cursor:pointer; }
    .btn-checkout:disabled { opacity:.6; cursor:not-allowed; }
    .success { color:#27ae60; font-weight:600; margin-top:1rem; text-align:center; }
    .error { color:#e94560; margin-top:1rem; text-align:center; }
  `]
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  checkingOut = false;
  successMsg = '';
  errorMsg = '';

  ngOnInit() { this.cartService.loadCart().subscribe(); }

  updateQty(productId: string, qty: number) {
    if (qty < 1) return;
    this.cartService.updateItem(productId, qty).subscribe();
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId).subscribe();
  }

  checkout() {
    this.checkingOut = true;
    this.errorMsg = '';
    this.orderService.checkout().subscribe({
      next: order => {
        this.cartService.clearLocal();
        this.successMsg = `¡Pedido ${order.orderNumber} creado! Redirigiendo...`;
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: err => {
        this.errorMsg = err.error?.error ?? 'Error al procesar el pedido';
        this.checkingOut = false;
      }
    });
  }
}
