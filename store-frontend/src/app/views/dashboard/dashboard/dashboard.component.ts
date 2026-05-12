import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { OrderStatus } from '../../../models/order.model';
import { Customer, CustomerStatus } from '../../../models/customer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  user: any;
  role: string = '';

  // Admin/Worker metrics
  metrics = {
    totalProducts: 0,
    activeProducts: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    lowStockItems: 0,
  };

  // Customer data
  customer: Customer | null = null;
  customerOrders = {
    total: 0,
    pending: 0,
    confirmed: 0,
  };

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private router: Router,
  ) {
    this.user = this.authService.getUser();
    this.role = this.user?.role;
  }

  ngOnInit(): void {
    if (this.role === 'Customer') {
      this.loadCustomerDashboard();
    } else {
      this.loadAdminDashboard();
    }
  }

  loadAdminDashboard(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.metrics.totalProducts = products.length;
        this.metrics.activeProducts = products.filter(p => p.isActive).length;
      }
    });

    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.metrics.totalCustomers = customers.length;
        this.metrics.activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
      }
    });

    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.metrics.pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING_REVIEW).length;
        this.metrics.confirmedOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
        this.loading = false;
      }
    });

    this.inventoryService.getAll().subscribe({
      next: (items) => {
        this.metrics.lowStockItems = items.filter(i => i.isLowStock).length;
      }
    });
  }

  loadCustomerDashboard(): void {
    this.loading = true;
    this.customerService.getByAuthUserId(this.user.id).subscribe({
      next: (customer) => {
        this.customer = customer;
        if (customer.status === CustomerStatus.ACTIVE) {
          this.orderService.getAll(customer.id).subscribe({
            next: (orders) => {
              this.customerOrders.total = orders.length;
              this.customerOrders.pending = orders.filter(o => o.status === OrderStatus.PENDING_REVIEW).length;
              this.customerOrders.confirmed = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  isProfileComplete(): boolean {
    return !!(this.customer?.phone && this.customer?.address);
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  goToOrders(): void {
    this.router.navigate(['/my-orders']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}