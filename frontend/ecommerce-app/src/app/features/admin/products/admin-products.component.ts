import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  errorMsg = signal('');

  productForm = this.fb.group({
    code: [''],
    name: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    size: [9, Validators.required],
    color: ['White', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.productService.getAll().subscribe(p => this.products.set(p));
  }

  openForm() { this.showForm.set(true); this.editingId.set(null); this.productForm.reset({ size: 9, color: 'White', price: 0, stock: 0 }); }
  closeForm() { this.showForm.set(false); this.editingId.set(null); }

  edit(p: Product) {
    this.editingId.set(p.id);
    this.productForm.patchValue({ name: p.name, description: p.description, imageUrl: p.imageUrl, size: p.size, color: p.color, price: p.price, stock: p.stock });
    this.showForm.set(true);
  }

  save() {
    this.errorMsg.set('');
    const v = this.productForm.value;
    const req = { name: v.name!, description: v.description!, imageUrl: v.imageUrl!, size: Number(v.size) as any, color: v.color as any, price: Number(v.price), stock: Number(v.stock) };

    const op = this.editingId()
      ? this.productService.update(this.editingId()!, req)
      : this.productService.create({ ...req, code: v.code! });

    op.subscribe({ next: () => { this.closeForm(); this.loadProducts(); }, error: e => this.errorMsg.set(e.error?.error ?? 'Error') });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  colorLabel(c: string) { return { White: 'Blanco', Black: 'Negro', Gray: 'Gris' }[c] ?? c; }
  colorHex(c: string)   { return { White: '#ffffff', Black: '#0a0a0a', Gray: '#9ca3af' }[c] ?? '#ddd'; }
}
