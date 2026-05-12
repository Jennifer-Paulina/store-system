import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, CustomerStatus } from '../../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = true;
  displayedColumns = ['name', 'email', 'phone', 'status', 'actions'];

  searchText = '';
  filterStatus = '';

  constructor(
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(c => {
      const matchText = !this.searchText ||
        c.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.phone?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStatus = !this.filterStatus || c.status === this.filterStatus;

      return matchText && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filteredCustomers = this.customers;
  }

  getStatusLabel(status: CustomerStatus): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: CustomerStatus): string {
    const classes: Record<string, string> = {
      'PENDING': 'pending',
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
    };
    return classes[status] ?? '';
  }

  approve(customer: Customer): void {
    if (!confirm(`¿Aprobar al cliente "${customer.name}"?`)) return;
    this.customerService.approve(customer.id).subscribe({
      next: () => {
        this.snackBar.open('Cliente aprobado', 'Cerrar', { duration: 3000 });
        this.loadCustomers();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al aprobar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deactivate(customer: Customer): void {
    if (!confirm(`¿Desactivar al cliente "${customer.name}"?`)) return;
    this.customerService.deactivate(customer.id).subscribe({
      next: () => {
        this.snackBar.open('Cliente desactivado', 'Cerrar', { duration: 3000 });
        this.loadCustomers();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al desactivar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  delete(customer: Customer): void {
    if (!confirm(`¿Eliminar al cliente "${customer.name}"?`)) return;
    this.customerService.delete(customer.id).subscribe({
      next: () => {
        this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 });
        this.loadCustomers();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}