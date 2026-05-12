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
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  suppliers: Supplier[] = [];
  loading = true;
  showForm = false;
  editingProduct: Product | null = null;
  form: FormGroup;
  displayedColumns = ['id', 'name', 'price', 'category', 'supplier', 'status', 'actions'];

  // Filtros
  searchText = '';
  filterCategory: number | null = null;
  filterSupplier: number | null = null;
  filterStatus: string = '';
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      supplierId: [null],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({ next: (data) => this.categories = data });
    this.supplierService.getAll().subscribe({ next: (data) => this.suppliers = data });
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchText = !this.searchText ||
        p.name.toLowerCase().includes(this.searchText.toLowerCase());

      const matchCategory = !this.filterCategory ||
        p.categoryId === this.filterCategory;

      const matchSupplier = !this.filterSupplier ||
        p.supplierId === this.filterSupplier;

      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'active' ? p.isActive : !p.isActive);

      const matchPriceMin = this.filterPriceMin === null || this.filterPriceMin < 0 ||
      p.price >= this.filterPriceMin;

      const matchPriceMax = this.filterPriceMax === null || this.filterPriceMax < 0 ||
        p.price <= this.filterPriceMax;

      return matchText && matchCategory && matchSupplier && matchStatus && matchPriceMin && matchPriceMax;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterCategory = null;
    this.filterSupplier = null;
    this.filterStatus = '';
    this.filterPriceMin = null;
    this.filterPriceMax = null;
    this.filteredProducts = this.products;
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name || '—';
  }

  getSupplierName(supplierId?: number): string {
    if (!supplierId) return '—';
    return this.suppliers.find(s => s.id === supplierId)?.name || '—';
  }

  openForm(product?: Product): void {
    this.editingProduct = product || null;
    this.showForm = true;
    if (product) {
      this.form.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
      });
    } else {
      this.form.reset();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const data = this.form.value;

    if (this.editingProduct) {
      this.productService.update(this.editingProduct.id, data).subscribe({
        next: () => {
          this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.productService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
          this.closeForm();
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al crear', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  delete(product: Product): void {
    if (!confirm(`¿Eliminar el producto "${product.name}"?`)) return;
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleStatus(product: Product): void {
    this.productService.update(product.id, { isActive: !product.isActive }).subscribe({
      next: () => {
        this.snackBar.open(`Producto ${product.isActive ? 'desactivado' : 'activado'}`, 'Cerrar', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }
}