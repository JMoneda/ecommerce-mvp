import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="grid-2">
            <div class="form-group">
              <label>Nombres</label>
              <input type="text" formControlName="firstName" placeholder="Juan">
              @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                <span class="error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Apellidos</label>
              <input type="text" formControlName="lastName" placeholder="García">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Edad</label>
              <input type="number" formControlName="age" placeholder="25">
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" formControlName="dateOfBirth">
            </div>
          </div>
          <div class="grid-3">
            <div class="form-group">
              <label>País</label>
              <input type="text" formControlName="country" placeholder="Colombia">
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <input type="text" formControlName="state" placeholder="Antioquia">
            </div>
            <div class="form-group">
              <label>Ciudad</label>
              <input type="text" formControlName="city" placeholder="Medellín">
            </div>
          </div>
          <div class="form-group">
            <label>Celular</label>
            <input type="tel" formControlName="phone" placeholder="3001234567">
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" formControlName="address" placeholder="Calle 1 # 1-1">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="error">Email válido requerido</span>
            }
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="Mínimo 6 caracteres">
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error">Mínimo 6 caracteres</span>
            }
          </div>
          @if (errorMsg()) { <p class="error-msg">{{ errorMsg() }}</p> }
          <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary">
            {{ loading() ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
        <p class="link">¿Ya tienes cuenta? <a routerLink="/auth/login">Iniciar Sesión</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display:flex; justify-content:center; padding:2rem; }
    .auth-card { background:#fff; padding:2rem; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,.1); width:100%; max-width:600px; }
    h2 { text-align:center; color:#1a1a2e; margin-bottom:1.5rem; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.4rem; font-weight:600; color:#444; font-size:.9rem; }
    input { width:100%; padding:.7rem; border:1px solid #ddd; border-radius:4px; box-sizing:border-box; font-size:.9rem; }
    input:focus { outline:none; border-color:#e94560; }
    .error { color:#e94560; font-size:.75rem; }
    .error-msg { background:#fee; color:#e94560; padding:.6rem; border-radius:4px; text-align:center; }
    .btn-primary { width:100%; padding:.8rem; background:#e94560; color:#fff; border:none; border-radius:4px; font-size:1rem; cursor:pointer; }
    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
    .link { text-align:center; margin-top:1rem; }
    .link a { color:#e94560; }
    @media(max-width:500px) { .grid-2,.grid-3 { grid-template-columns:1fr; } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    age: [null, [Validators.required, Validators.min(1)]],
    dateOfBirth: ['', Validators.required],
    country: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  errorMsg = signal('');

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.authService.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/catalog']),
      error: err => {
        this.errorMsg.set(err.error?.error ?? 'Error al registrarse');
        this.loading.set(false);
      }
    });
  }
}
