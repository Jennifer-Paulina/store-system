import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  cart: CartItem[] = [];
  showCart = false;

  searchText = '';
  filterCategory: number | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private router: Router,
    private customerService: CustomerService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.checkProfileComplete();
    this.loadData();
  }

  checkProfileComplete(): void {
    const user = this.authService.getUser();
    this.customerService.getByAuthUserId(user.id).subscribe({
      next: (customer) => {
        if (!customer.phone || !customer.address) {
          this.snackBar.open(
            'Completa tu perfil antes de realizar pedidos',
            'Ir a perfil',
            { duration: 6000 }
          ).onAction().subscribe(() => {
            this.router.navigate(['/profile']);
          });
        }
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({ next: (data) => this.categories = data });
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive);
        this.filteredProducts = this.products;
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
      return matchText && matchCategory;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterCategory = null;
    this.filteredProducts = this.products;
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name || '—';
  }

  getCartQuantity(product: Product): number {
    return this.cart.find(i => i.product.id === product.id)?.quantity || 0;
  }

  addToCart(product: Product): void {
    const existing = this.cart.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.snackBar.open(`${product.name} agregado al carrito`, 'Cerrar', { duration: 2000 });
  }

  removeFromCart(product: Product): void {
    const existing = this.cart.find(i => i.product.id === product.id);
    if (existing) {
      if (existing.quantity > 1) {
        existing.quantity--;
      } else {
        this.cart = this.cart.filter(i => i.product.id !== product.id);
      }
    }
  }

  getTotalItems(): number {
    return this.cart.reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  checkout(): void {
    if (this.cart.length === 0) return;
    this.router.navigate(['/my-orders'], { state: { cart: this.cart } });
  }
}