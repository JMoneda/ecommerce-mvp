import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
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

  hasFilters = computed(() => {
    const v = this.filterForm.value;
    return !!(v.name || v.description || v.code || v.size || v.color);
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

  inc(p: Product) {
    const c = this.quantityForm.get(p.id);
    if (c) c.setValue(Math.min(p.stock, (c.value ?? 1) + 1));
  }
  dec(p: Product) {
    const c = this.quantityForm.get(p.id);
    if (c) c.setValue(Math.max(1, (c.value ?? 1) - 1));
  }

  clearFilters() { this.filterForm.reset({ name: '', description: '', code: '', size: '', color: '' }); }

  addToCart(product: Product) {
    const qty = this.quantityForm.get(product.id)?.value ?? 1;
    this.cartService.addItem(product.id, qty).subscribe();
  }

  colorLabel(c: ProductColor) {
    return { White: 'Blanco', Black: 'Negro', Gray: 'Gris' }[c] ?? c;
  }
  colorHex(c: ProductColor) {
    return { White: '#ffffff', Black: '#0a0a0a', Gray: '#9ca3af' }[c] ?? '#ddd';
  }
}
