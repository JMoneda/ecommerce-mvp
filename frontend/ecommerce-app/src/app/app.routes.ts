import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    ]
  },
  { path: 'catalog', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'product/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
    ]
  },
  { path: '**', redirectTo: 'catalog' }
];
