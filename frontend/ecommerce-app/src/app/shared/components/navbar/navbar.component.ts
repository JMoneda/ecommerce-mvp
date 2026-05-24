import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);

  open = signal(false);
  toggle() { this.open.update(v => !v); }
  close() { this.open.set(false); }

  initials() {
    const name = this.auth.user()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
  }

  @HostListener('window:resize') onResize() { if (window.innerWidth > 880) this.close(); }
}
