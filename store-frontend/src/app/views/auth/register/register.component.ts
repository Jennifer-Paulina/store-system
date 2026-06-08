import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phone: [''],
      address: [''],
    }, { validators: this.passwordMatchValidator });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get passwordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') && 
      !!this.registerForm.get('confirmPassword')?.dirty;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;

    const { name, email, password, phone, address } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: (authResponse) => {
        this.authService.saveTokens(authResponse);
        this.customerService.create({
          authUserId: authResponse.id,
          name,
          email,
          phone,
          address,
        }).subscribe({
          next: () => {
            this.loading = false;
            this.snackBar.open('Registro exitoso. Tu cuenta está pendiente de aprobación.', 'Cerrar', { duration: 5000 });
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: (err: any) => {
            this.loading = false;
            const msg = err?.error?.message || 'El registro fue exitoso pero no se pudo crear tu perfil. Contacta al administrador.';
            this.snackBar.open(msg, 'Cerrar', { duration: 6000 });
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Error al registrarse';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}