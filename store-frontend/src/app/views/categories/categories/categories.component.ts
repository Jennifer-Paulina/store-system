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
import { MatChipsModule } from '@angular/material/chips';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-categories',
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
    MatChipsModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = true;
  showForm = false;
  editingCategory: Category | null = null;
  form: FormGroup;
  displayedColumns = ['name', 'description', 'status', 'actions'];

  searchText = '';
  filterStatus = '';

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter(c => {
      const matchText = !this.searchText ||
        c.name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'active' ? c.isActive : !c.isActive);
      return matchText && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filteredCategories = this.categories;
  }

  openForm(category?: Category): void {
    this.editingCategory = category || null;
    this.showForm = true;
    if (category) {
      this.form.patchValue({ name: category.name, description: category.description });
    } else {
      this.form.reset();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory.id, data).subscribe({
        next: () => {
          this.snackBar.open('Categoría actualizada', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.categoryService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Categoría creada', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al crear', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  delete(category: Category): void {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleStatus(category: Category): void {
    this.categoryService.update(category.id, { isActive: !category.isActive }).subscribe({
      next: () => {
        this.snackBar.open(`Categoría ${category.isActive ? 'desactivada' : 'activada'}`, 'Cerrar', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }
}