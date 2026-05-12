import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { Order, OrderStatus, CreateOrderRequest } from '../../../models/order.model';
import { CartItem } from '../../catalog/catalog/catalog.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDividerModule,
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  placingOrder = false;
  customerId: number | null = null;
  cart: CartItem[] = [];
  displayedColumns = ['id', 'total', 'status', 'date', 'actions'];
  OrderStatus = OrderStatus;
  productNames: Record<number, string> = {};

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.cart = navigation?.extras?.state?.['cart'] || [];
  }

  ngOnInit(): void {
    this.loadCustomerAndOrders();
    this.loadProductNames();
  }

  loadProductNames(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        products.forEach(p => this.productNames[p.id] = p.name);
      }
    });
  }

  loadCustomerAndOrders(): void {
    const user = this.authService.getUser();
    this.customerService.getByAuthUserId(user.id).subscribe({
      next: (customer) => {
        this.customerId = customer.id;

        if (!customer.phone || !customer.address) {
          this.snackBar.open(
            'Debes completar tu perfil antes de realizar pedidos',
            'Ir a perfil',
            { duration: 6000 }
          ).onAction().subscribe(() => {
            this.router.navigate(['/profile']);
          });
          this.cart = [];
          this.loadOrders();
          return;
        }

        if (this.cart.length > 0) {
          this.placeOrder();
        } else {
          this.loadOrders();
        }
      },
      error: () => {
        this.snackBar.open('No se encontró tu perfil de cliente', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    if (!this.customerId) return;
    this.loading = true;
    this.orderService.getAll(this.customerId).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  placeOrder(): void {
    if (!this.customerId || this.cart.length === 0) return;
    this.placingOrder = true;

    const request: CreateOrderRequest = {
      customerId: this.customerId,
      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))
    };

    this.orderService.create(request).subscribe({
      next: () => {
        this.cart = [];
        this.placingOrder = false;
        this.snackBar.open('Pedido realizado correctamente', 'Cerrar', { duration: 3000 });
        this.loadOrders();
      },
      error: (err: any) => {
        this.placingOrder = false;
        this.snackBar.open(err.error?.message || 'Error al realizar el pedido', 'Cerrar', { duration: 3000 });
        this.loadOrders();
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<string, string> = {
      'PENDING_REVIEW': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'REJECTED': 'Rechazado',
      'CONFIRMATION_FAILED_STOCK': 'Sin stock',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<string, string> = {
      'PENDING_REVIEW': 'pending',
      'CONFIRMED': 'confirmed',
      'REJECTED': 'rejected',
      'CONFIRMATION_FAILED_STOCK': 'failed',
    };
    return classes[status] ?? '';
  }

  downloadTicket(order: Order): void {
    this.orderService.downloadTicket(order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket_pedido_${order.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('No hay ticket disponible', 'Cerrar', { duration: 3000 });
      }
    });
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
}