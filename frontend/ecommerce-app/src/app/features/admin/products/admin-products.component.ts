import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div>
      <div class="header">
        <h1>Gestión de Productos</h1>
        <button (click)="openForm()" class="btn-new">+ Nuevo Producto</button>
      </div>

      @if (showForm()) {
        <div class="form-panel">
          <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} Producto</h3>
          <form [formGroup]="productForm" (ngSubmit)="save()">
            <div class="grid-2">
              @if (!editingId()) {
                <div class="form-group">
                  <label>Código</label>
                  <input formControlName="code">
                </div>
              }
              <div class="form-group">
                <label>Nombre</label>
                <input formControlName="name">
              </div>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <input formControlName="description">
            </div>
            <div class="form-group">
              <label>URL Imagen</label>
              <input formControlName="imageUrl">
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Talla</label>
                <select formControlName="size">
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </div>
              <div class="form-group">
                <label>Color</label>
                <select formControlName="color">
                  <option value="White">Blanco</option>
                  <option value="Black">Negro</option>
                  <option value="Gray">Gris</option>
                </select>
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Precio</label>
                <input type="number" formControlName="price">
              </div>
              <div class="form-group">
                <label>Stock</label>
                <input type="number" formControlName="stock">
              </div>
            </div>
            @if (errorMsg()) { <p class="error">{{ errorMsg() }}</p> }
            <div class="form-actions">
              <button type="submit" class="btn-save" [disabled]="productForm.invalid">Guardar</button>
              <button type="button" (click)="closeForm()" class="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      }

      <table class="table">
        <thead>
          <tr><th>Código</th><th>Nombre</th><th>Talla</th><th>Color</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          @for (p of products(); track p.id) {
            <tr>
              <td>{{ p.code }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.size }}</td>
              <td>{{ p.color }}</td>
              <td>{{ p.price | currency:'COP':'symbol':'1.0-0' }}</td>
              <td>{{ p.stock }}</td>
              <td>
                <button (click)="edit(p)" class="btn-edit">Editar</button>
                <button (click)="delete(p.id)" class="btn-delete">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    h1 { color:#1a1a2e; }
    .btn-new { background:#e94560; color:#fff; border:none; padding:.7rem 1.2rem; border-radius:4px; cursor:pointer; }
    .form-panel { background:#fff; padding:1.5rem; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,.1); margin-bottom:2rem; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.3rem; font-weight:600; color:#444; font-size:.9rem; }
    input,select { width:100%; padding:.6rem; border:1px solid #ddd; border-radius:4px; box-sizing:border-box; }
    .form-actions { display:flex; gap:.8rem; margin-top:1rem; }
    .btn-save { background:#1a1a2e; color:#fff; border:none; padding:.7rem 1.5rem; border-radius:4px; cursor:pointer; }
    .btn-cancel { background:#888; color:#fff; border:none; padding:.7rem 1.5rem; border-radius:4px; cursor:pointer; }
    .error { color:#e94560; }
    .table { width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.08); }
    th { background:#1a1a2e; color:#fff; padding:.8rem 1rem; text-align:left; }
    td { padding:.8rem 1rem; border-bottom:1px solid #eee; }
    tr:hover td { background:#f9f9f9; }
    .btn-edit { background:#1a1a2e; color:#fff; border:none; padding:.4rem .8rem; border-radius:4px; cursor:pointer; margin-right:.4rem; }
    .btn-delete { background:#e94560; color:#fff; border:none; padding:.4rem .8rem; border-radius:4px; cursor:pointer; }
  `]
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
}
