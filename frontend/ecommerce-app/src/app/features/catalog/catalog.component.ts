import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductColor, ProductSize } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="catalog">
      <h1>Catálogo de Tenis</h1>

      <!-- Filtros -->
      <form [formGroup]="filterForm" class="filters">
        <input formControlName="name" placeholder="Buscar por nombre...">
        <input formControlName="description" placeholder="Descripción...">
        <input formControlName="code" placeholder="Código...">
        <select formControlName="size">
          <option value="">Todas las tallas</option>
          <option value="7">Talla 7</option>
          <option value="8">Talla 8</option>
          <option value="9">Talla 9</option>
          <option value="10">Talla 10</option>
        </select>
        <select formControlName="color">
          <option value="">Todos los colores</option>
          <option value="White">Blanco</option>
          <option value="Black">Negro</option>
          <option value="Gray">Gris</option>
        </select>
        <button type="button" (click)="clearFilters()" class="btn-clear">Limpiar</button>
      </form>

      @if (loading()) {
        <div class="loading">Cargando productos...</div>
      } @else if (products().length === 0) {
        <div class="empty">No se encontraron productos</div>
      } @else {
        <div class="product-grid" [formGroup]="quantityForm">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <a [routerLink]="['/product', product.id]">
                <div class="product-img">
                  <img [src]="product.imageUrl" [alt]="product.name" onerror="this.src='/placeholder.jpg'">
                  @if (!product.isAvailable) {
                    <span class="sold-out">Agotado</span>
                  }
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="price">{{ product.price | currency:'COP':'symbol':'1.0-0' }}</p>
                  <p class="meta">Talla {{ product.size }} · {{ colorLabel(product.color) }}</p>
                </div>
              </a>
              @if (product.isAvailable && auth.isAuthenticated()) {
                <div class="add-to-cart">
                  <input type="number" [formControlName]="product.id" min="1" [max]="product.stock">
                  <button (click)="addToCart(product)" class="btn-add">Agregar</button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog h1 { color:#1a1a2e; margin-bottom:1.5rem; }
    .filters { display:flex; gap:.8rem; flex-wrap:wrap; margin-bottom:2rem; }
    .filters input, .filters select { padding:.6rem; border:1px solid #ddd; border-radius:4px; flex:1; min-width:150px; }
    .btn-clear { padding:.6rem 1rem; background:#888; color:#fff; border:none; border-radius:4px; cursor:pointer; }
    .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:1.5rem; }
    .product-card { background:#fff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,.08); overflow:hidden; transition:transform .2s; }
    .product-card:hover { transform:translateY(-4px); }
    .product-card a { text-decoration:none; color:inherit; }
    .product-img { position:relative; height:200px; overflow:hidden; background:#f5f5f5; }
    .product-img img { width:100%; height:100%; object-fit:cover; }
    .sold-out { position:absolute; top:10px; right:10px; background:#e94560; color:#fff; padding:4px 8px; border-radius:4px; font-size:.8rem; }
    .product-info { padding:1rem; }
    .product-info h3 { margin:0 0 .5rem; color:#1a1a2e; }
    .price { color:#e94560; font-weight:700; font-size:1.1rem; margin:.3rem 0; }
    .meta { color:#888; font-size:.85rem; }
    .add-to-cart { display:flex; gap:.5rem; padding:.8rem; border-top:1px solid #eee; }
    .add-to-cart input { width:60px; padding:.4rem; border:1px solid #ddd; border-radius:4px; text-align:center; }
    .btn-add { flex:1; background:#1a1a2e; color:#fff; border:none; border-radius:4px; cursor:pointer; padding:.4rem; }
    .btn-add:hover { background:#e94560; }
    .loading, .empty { text-align:center; padding:3rem; color:#888; font-size:1.1rem; }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  products = signal<Product[]>([]);
  loading = signal(true);

  filterForm = this.fb.group({
    name: [''],
    description: [''],
    code: [''],
    size: [''],
    color: ['']
  });

  /** Cantidad por producto: un FormControl reactivo por cada tarjeta. */
  quantityForm = new FormRecord<FormControl<number>>({});

  ngOnInit() {
    this.loadProducts();
    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => this.loadProducts());
    if (this.auth.isAuthenticated()) this.cartService.loadCart().subscribe();
  }

  loadProducts() {
    this.loading.set(true);
    const v = this.filterForm.value;
    this.productService.getAll({
      name: v.name || undefined,
      description: v.description || undefined,
      code: v.code || undefined,
      size: v.size ? Number(v.size) as ProductSize : undefined,
      color: v.color as ProductColor || undefined
    }).subscribe({
      next: p => {
        this.products.set(p);
        this.buildQuantityControls(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildQuantityControls(products: Product[]) {
    Object.keys(this.quantityForm.controls).forEach(k => this.quantityForm.removeControl(k));
    for (const p of products) {
      this.quantityForm.addControl(p.id, new FormControl(1, { nonNullable: true }));
    }
  }

  clearFilters() { this.filterForm.reset(); }

  addToCart(product: Product) {
    const qty = this.quantityForm.get(product.id)?.value ?? 1;
    this.cartService.addItem(product.id, qty).subscribe();
  }

  colorLabel(c: ProductColor) {
    return { White: 'Blanco', Black: 'Negro', Gray: 'Gris' }[c] ?? c;
  }
}
