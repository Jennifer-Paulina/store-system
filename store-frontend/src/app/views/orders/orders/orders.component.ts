import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderDetailDialogComponent } from '../../../shared/components/order-detail-dialog/order-detail-dialog.component';

@Component({
  selector: 'app-orders',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDialogModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  displayedColumns = ['id', 'customer', 'total', 'status', 'date', 'actions'];
  OrderStatus = OrderStatus;
  productNames: Record<number, string> = {};

  searchId = '';
  filterStatus = '';
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadProductNames();
  }

  loadProductNames(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        products.forEach(p => this.productNames[p.id] = p.name);
      }
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(o => {
      const matchId = !this.searchId || o.id.toString().includes(this.searchId);
      const matchStatus = !this.filterStatus || o.status === this.filterStatus;
      const orderDate = new Date(o.createdAt);
      const matchDateFrom = !this.filterDateFrom || orderDate >= this.filterDateFrom;
      const matchDateTo = !this.filterDateTo ||
        orderDate <= new Date(this.filterDateTo.getTime() + 86400000);
      return matchId && matchStatus && matchDateFrom && matchDateTo;
    });
  }

  clearFilters(): void {
    this.searchId = '';
    this.filterStatus = '';
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.filteredOrders = this.orders;
  }

  toggleExpand(order: Order): void {
    this.dialog.open(OrderDetailDialogComponent, {
      width: '700px',
      data: {
        order,
        productNames: this.productNames
      }
    });
  }

  getProductName(productId: number): string {
    return this.productNames[productId] ?? `Producto #${productId}`;
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

  confirm(order: Order): void {
    if (!confirm(`¿Confirmar el pedido #${order.id}?`)) return;
    this.orderService.confirm(order.id).subscribe({
      next: () => {
        this.snackBar.open('Pedido confirmado', 'Cerrar', { duration: 3000 });
        this.loadOrders();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al confirmar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  reject(order: Order): void {
    if (!confirm(`¿Rechazar el pedido #${order.id}?`)) return;
    this.orderService.reject(order.id).subscribe({
      next: () => {
        this.snackBar.open('Pedido rechazado', 'Cerrar', { duration: 3000 });
        this.loadOrders();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Error al rechazar', 'Cerrar', { duration: 3000 });
      }
    });
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
        this.snackBar.open('No hay ticket disponible para este pedido', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
  isDetailRow = (index: number, row: any) => true;
}