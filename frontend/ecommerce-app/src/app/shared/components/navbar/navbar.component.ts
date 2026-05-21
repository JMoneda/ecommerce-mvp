import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <a routerLink="/catalog" class="brand">👟 SportShop</a>
      <div class="nav-links">
        <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>
        @if (auth.isAuthenticated()) {
          <a routerLink="/cart" routerLinkActive="active">
            Carrito <span class="badge">{{ cart.itemCount() }}</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active">Mis Pedidos</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin</a>
          }
          <button (click)="auth.logout()" class="btn-logout">Salir ({{ auth.user()?.fullName }})</button>
        } @else {
          <a routerLink="/auth/login" routerLinkActive="active">Iniciar Sesión</a>
          <a routerLink="/auth/register" routerLinkActive="active" class="btn-register">Registrarse</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar { display:flex; align-items:center; justify-content:space-between; padding:1rem 2rem; background:#1a1a2e; color:#fff; }
    .brand { color:#e94560; font-size:1.4rem; font-weight:700; text-decoration:none; }
    .nav-links { display:flex; gap:1.2rem; align-items:center; }
    .nav-links a { color:#ccc; text-decoration:none; transition:color .2s; }
    .nav-links a:hover, .nav-links a.active { color:#e94560; }
    .badge { background:#e94560; color:#fff; border-radius:50%; padding:2px 6px; font-size:.75rem; margin-left:4px; }
    .btn-logout { background:transparent; border:1px solid #e94560; color:#e94560; padding:.4rem .8rem; border-radius:4px; cursor:pointer; }
    .btn-register { background:#e94560; color:#fff !important; padding:.4rem .9rem; border-radius:4px; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
