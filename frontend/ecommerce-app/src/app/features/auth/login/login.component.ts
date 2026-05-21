import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="error">Email requerido y válido</span>
            }
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••">
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error">Mínimo 6 caracteres</span>
            }
          </div>
          @if (errorMsg) { <p class="error-msg">{{ errorMsg }}</p> }
          <button type="submit" [disabled]="form.invalid || loading" class="btn-primary">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <p class="link">¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display:flex; justify-content:center; align-items:center; min-height:80vh; }
    .auth-card { background:#fff; padding:2rem; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,.1); width:100%; max-width:400px; }
    h2 { text-align:center; color:#1a1a2e; margin-bottom:1.5rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.4rem; font-weight:600; color:#444; }
    input { width:100%; padding:.7rem; border:1px solid #ddd; border-radius:4px; box-sizing:border-box; font-size:1rem; }
    input:focus { outline:none; border-color:#e94560; }
    .error { color:#e94560; font-size:.8rem; }
    .error-msg { background:#fee; color:#e94560; padding:.6rem; border-radius:4px; text-align:center; }
    .btn-primary { width:100%; padding:.8rem; background:#e94560; color:#fff; border:none; border-radius:4px; font-size:1rem; cursor:pointer; margin-top:.5rem; }
    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
    .link { text-align:center; margin-top:1rem; }
    .link a { color:#e94560; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        this.router.navigate(['/catalog']);
      },
      error: err => {
        this.errorMsg = err.error?.error ?? 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
