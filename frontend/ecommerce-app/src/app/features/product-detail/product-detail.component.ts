import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (loading()) {
      <div class="loading">Cargando...</div>
    } @else if (product()) {
      <div class="detail">
        <div class="detail-img">
          <img [src]="product()!.imageUrl" [alt]="product()!.name" onerror="this.src='/placeholder.jpg'">
        </div>
        <div class="detail-info">
          <span class="code">{{ product()!.code }}</span>
          <h1>{{ product()!.name }}</h1>
          <p class="price">{{ product()!.price | currency:'COP':'symbol':'1.0-0' }}</p>
          <p class="description">{{ product()!.description }}</p>
          <div class="specs">
            <div><strong>Talla:</strong> {{ product()!.size }}</div>
            <div><strong>Color:</strong> {{ colorLabel(product()!.color) }}</div>
            <div><strong>Stock:</strong>
              @if (product()!.isAvailable) {
                <span class="available">{{ product()!.stock }} disponibles</span>
              } @else {
                <span class="sold-out">Agotado</span>
              }
            </div>
          </div>
          @if (product()!.isAvailable && auth.isAuthenticated()) {
            <div class="add-to-cart">
              <label>Cantidad:</label>
              <input type="number" [formControl]="quantityControl" min="1" [max]="product()!.stock">
              <button (click)="addToCart()" class="btn-add" [disabled]="adding()">
                {{ adding() ? 'Agregando...' : '🛒 Agregar al carrito' }}
              </button>
            </div>
          } @else if (!auth.isAuthenticated()) {
            <p class="hint">Inicia sesión para agregar al carrito</p>
          }
          @if (successMsg()) { <p class="success">{{ successMsg() }}</p> }
        </div>
      </div>
    } @else {
      <div class="empty">Producto no encontrado</div>
    }
  `,
  styles: [`
    .loading,.empty { text-align:center; padding:3rem; color:#888; }
    .detail { display:grid; grid-template-columns:1fr 1fr; gap:2rem; max-width:900px; margin:0 auto; }
    .detail-img img { width:100%; border-radius:8px; }
    .code { color:#888; font-size:.85rem; text-transform:uppercase; }
    h1 { color:#1a1a2e; margin:.5rem 0; }
    .price { color:#e94560; font-size:1.8rem; font-weight:700; }
    .description { color:#555; line-height:1.6; }
    .specs { display:flex; flex-direction:column; gap:.5rem; margin:1rem 0; padding:1rem; background:#f9f9f9; border-radius:6px; }
    .available { color:#27ae60; font-weight:600; }
    .sold-out { color:#e94560; font-weight:600; }
    .add-to-cart { display:flex; align-items:center; gap:1rem; margin-top:1.5rem; }
    .add-to-cart input { width:70px; padding:.6rem; border:1px solid #ddd; border-radius:4px; text-align:center; }
    .btn-add { padding:.8rem 1.5rem; background:#e94560; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:1rem; }
    .btn-add:disabled { opacity:.6; }
    .hint { color:#888; margin-top:1rem; }
    .success { color:#27ae60; font-weight:600; margin-top:.5rem; }
    @media(max-width:600px) { .detail { grid-template-columns:1fr; } }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  adding = signal(false);
  successMsg = signal('');
  quantityControl = new FormControl(1, { nonNullable: true });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addToCart() {
    if (!this.product()) return;
    this.adding.set(true);
    this.cartService.addItem(this.product()!.id, this.quantityControl.value).subscribe({
      next: () => {
        this.successMsg.set('Producto agregado al carrito');
        this.adding.set(false);
        setTimeout(() => this.successMsg.set(''), 2500);
      },
      error: () => this.adding.set(false)
    });
  }

  colorLabel(c: string) { return { White: 'Blanco', Black: 'Negro', Gray: 'Gris' }[c] ?? c; }
}
