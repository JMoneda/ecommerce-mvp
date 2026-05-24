import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
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

  inc() {
    const max = this.product()?.stock ?? 1;
    this.quantityControl.setValue(Math.min(max, this.quantityControl.value + 1));
  }
  dec() { this.quantityControl.setValue(Math.max(1, this.quantityControl.value - 1)); }

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
  colorHex(c: string)   { return { White: '#ffffff', Black: '#0a0a0a', Gray: '#9ca3af' }[c] ?? '#ddd'; }
}
