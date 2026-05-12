import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { UserService } from '../../../core/services/user.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  customer: Customer | null = null;
  loading = true;
  editingProfile = false;
  editingPassword = false;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any;

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.user = this.authService.getUser();

    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      address: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.customerService.getByAuthUserId(this.user.id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.profileForm.patchValue({
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente de aprobación',
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'pending',
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
    };
    return classes[status] ?? '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.customer) return;
    const data = this.profileForm.value;
    this.customerService.update(this.customer.id, data).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
        this.editingProfile = false;
        this.loadProfile();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword } = this.passwordForm.value;
    this.userService.update(this.user.id, { password: newPassword }).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada', 'Cerrar', { duration: 3000 });
        this.editingPassword = false;
        this.passwordForm.reset();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar contraseña', 'Cerrar', { duration: 3000 });
      }
    });
  }
}