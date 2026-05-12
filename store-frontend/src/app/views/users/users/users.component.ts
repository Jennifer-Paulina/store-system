import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: any[] = [];
  loading = true;
  showForm = false;
  showRoleForm = false;
  editingUser: User | null = null;
  selectedUser: User | null = null;
  form: FormGroup;
  roleForm: FormGroup;
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  searchText = '';
  filterRole = '';

  createForm: FormGroup;
  showCreateForm = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.roleForm = this.fb.group({
      roleId: [null, Validators.required],
    });
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.getRoles().subscribe({ next: (data) => this.roles = data });
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchText = !this.searchText ||
        u.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchText.toLowerCase());
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchText && matchRole;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterRole = '';
    this.filteredUsers = this.users;
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'Admin': 'Administrador',
      'Worker': 'Trabajador',
      'Customer': 'Cliente',
    };
    return labels[role] ?? role;
  }

  getRoleClass(role: string): string {
    const classes: Record<string, string> = {
      'Admin': 'admin',
      'Worker': 'worker',
      'Customer': 'customer',
    };
    return classes[role] ?? '';
  }

  openForm(user?: User): void {
    this.editingUser = user || null;
    this.showForm = true;
    this.showRoleForm = false;
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset();
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.form.reset();
  }

  openRoleForm(user: User): void {
    this.selectedUser = user;
    this.showRoleForm = true;
    this.showForm = false;
    const role = this.roles.find(r => r.name === user.role);
    this.roleForm.patchValue({ roleId: role?.id });
  }

  closeRoleForm(): void {
    this.showRoleForm = false;
    this.selectedUser = null;
    this.roleForm.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const data = this.form.value;

    if (this.editingUser) {
      this.userService.update(this.editingUser.id, { name: data.name, email: data.email }).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadData();
        },
        error: (err: any) => {
          this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Para crear usuarios usa el registro', 'Cerrar', { duration: 3000 });
    }
  }

  saveRole(): void {
    if (this.roleForm.invalid || !this.selectedUser) return;
    const { roleId } = this.roleForm.value;
    this.userService.changeRole(this.selectedUser.id, roleId).subscribe({
      next: () => {
        this.snackBar.open('Rol actualizado', 'Cerrar', { duration: 3000 });
        this.closeRoleForm();
        this.loadData();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al cambiar rol', 'Cerrar', { duration: 3000 });
      }
    });
  }

  delete(user: User): void {
    if (!confirm(`¿Eliminar al usuario "${user.name}"?`)) return;
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
        this.loadData();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.showForm = false;
    this.showRoleForm = false;
    this.createForm.reset();
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createForm.reset();
  }

  createUser(): void {
    if (this.createForm.invalid) return;
    const { name, email, password, roleId } = this.createForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: (response) => {
        this.userService.changeRole(response.id, roleId).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
            this.closeCreateForm();
            this.loadData();
          },
          error: (err: any) => {
            this.snackBar.open(err.error?.message || 'Error al asignar rol', 'Cerrar', { duration: 3000 });
            this.loadData();
          }
        });
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al crear usuario', 'Cerrar', { duration: 3000 });
      }
    });
  }
}