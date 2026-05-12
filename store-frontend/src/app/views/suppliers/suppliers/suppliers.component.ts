import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = true;
  showForm = false;
  editingSupplier: Supplier | null = null;
  form: FormGroup;
  displayedColumns = ['name', 'contact', 'phone', 'email', 'status', 'actions'];

  searchText = '';
  filterStatus = '';

  constructor(
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      contact: [''],
      phone: [''],
      email: ['', [Validators.email]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredSuppliers = this.suppliers.filter(s => {
      const matchText = !this.searchText ||
        s.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.contact?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.email?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.phone?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'active' ? s.isActive : !s.isActive);

      return matchText && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filteredSuppliers = this.suppliers;
  }

  openForm(supplier?: Supplier): void {
    this.editingSupplier = supplier || null;
    this.showForm = true;
    if (supplier) {
      this.form.patchValue({
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email,
        description: supplier.description,
      });
    } else {
      this.form.reset();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingSupplier = null;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    if (this.editingSupplier) {
      this.supplierService.update(this.editingSupplier.id, data).subscribe({
        next: () => {
          this.snackBar.open('Proveedor actualizado', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadSuppliers();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.supplierService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Proveedor creado', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadSuppliers();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al crear', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  delete(supplier: Supplier): void {
    if (!confirm(`¿Eliminar el proveedor "${supplier.name}"?`)) return;
    this.supplierService.delete(supplier.id).subscribe({
      next: () => {
        this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
        this.loadSuppliers();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleStatus(supplier: Supplier): void {
    this.supplierService.update(supplier.id, { isActive: !supplier.isActive }).subscribe({
      next: () => {
        this.snackBar.open(`Proveedor ${supplier.isActive ? 'desactivado' : 'activado'}`, 'Cerrar', { duration: 3000 });
        this.loadSuppliers();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }
}