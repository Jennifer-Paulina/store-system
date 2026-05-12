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
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryItem, MovementType } from '../../../models/inventory.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-inventory',
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
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  products: Product[] = [];
  productsWithoutInventory: Product[] = [];
  loading = true;
  showCreateForm = false;
  showAdjustForm = false;
  showEditMinStock = false;
  selectedItem: InventoryItem | null = null;
  createForm: FormGroup;
  adjustForm: FormGroup;
  minStockForm: FormGroup;
  displayedColumns = ['productId', 'product', 'stock', 'minStock', 'status', 'actions'];
  movementTypes = [
    { value: MovementType.IN, label: 'Entrada' },
    { value: MovementType.OUT, label: 'Salida' },
    { value: MovementType.ADJUSTMENT, label: 'Ajuste' },
  ];

  searchText = '';
  filterStatus = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.createForm = this.fb.group({
      productId: [null, Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
    });

    this.adjustForm = this.fb.group({
      quantity: [null, [Validators.required, Validators.min(1)]],
      type: [null, Validators.required],
      reference: [''],
    });

    this.minStockForm = this.fb.group({
      minStock: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.inventoryService.getAll().subscribe({
          next: (inventory) => {
            this.inventory = inventory;
            this.filteredInventory = inventory;
            this.productsWithoutInventory = products.filter(p =>
              !inventory.some(i => i.productId === p.id)
            );
            this.loading = false;
          },
          error: () => {
            this.snackBar.open('Error al cargar inventario', 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    });
  }

  applyFilters(): void {
    this.filteredInventory = this.inventory.filter(item => {
      const productName = this.getProductName(item.productId).toLowerCase();
      const matchText = !this.searchText ||
        productName.includes(this.searchText.toLowerCase()) ||
        item.productId.toString().includes(this.searchText);

      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'low' ? item.isLowStock : !item.isLowStock);

      return matchText && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filteredInventory = this.inventory;
  }

  getProductName(productId: number): string {
    return this.products.find(p => p.id === productId)?.name || '—';
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.showAdjustForm = false;
    this.showEditMinStock = false;
    this.createForm.reset({ stock: 0, minStock: 0 });
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createForm.reset();
  }

  create(): void {
    if (this.createForm.invalid) return;
    const data = this.createForm.value;
    this.inventoryService.create(data).subscribe({
      next: () => {
        this.snackBar.open('Inventario registrado correctamente', 'Cerrar', { duration: 3000 });
        this.closeCreateForm();
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al registrar inventario', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openAdjustForm(item: InventoryItem): void {
    this.selectedItem = item;
    this.showAdjustForm = true;
    this.showCreateForm = false;
    this.showEditMinStock = false;
    this.adjustForm.reset();
  }

  openEditMinStock(item: InventoryItem): void {
    this.selectedItem = item;
    this.showEditMinStock = true;
    this.showCreateForm = false;
    this.showAdjustForm = false;
    this.minStockForm.patchValue({ minStock: item.minStock });
  }

  closeAdjustForm(): void {
    this.showAdjustForm = false;
    this.selectedItem = null;
    this.adjustForm.reset();
  }

  closeEditMinStock(): void {
    this.showEditMinStock = false;
    this.selectedItem = null;
    this.minStockForm.reset();
  }

  adjust(): void {
    if (this.adjustForm.invalid || !this.selectedItem) return;
    const data = this.adjustForm.value;
    this.inventoryService.adjustStock(this.selectedItem.id, data).subscribe({
      next: () => {
        this.snackBar.open('Stock ajustado correctamente', 'Cerrar', { duration: 3000 });
        this.closeAdjustForm();
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al ajustar stock', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveMinStock(): void {
    if (this.minStockForm.invalid || !this.selectedItem) return;
    const { minStock } = this.minStockForm.value;
    this.inventoryService.updateMinStock(this.selectedItem.id, minStock).subscribe({
      next: () => {
        this.snackBar.open('Stock mínimo actualizado', 'Cerrar', { duration: 3000 });
        this.closeEditMinStock();
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar stock mínimo', 'Cerrar', { duration: 3000 });
      }
    });
  }
}