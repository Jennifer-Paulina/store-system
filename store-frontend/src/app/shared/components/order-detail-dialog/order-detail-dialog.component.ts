import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrl: './order-detail-dialog.component.css'
})
export class OrderDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      order: Order;
      productNames: Record<number, string>;
    },
    private dialogRef: MatDialogRef<OrderDetailDialogComponent>
  ) {}

  getProductName(productId: number): string {
    return this.data.productNames[productId] ?? `Producto #${productId}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING_REVIEW': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'REJECTED': 'Rechazado',
      'CONFIRMATION_FAILED_STOCK': 'Sin stock',
    };
    return labels[status] ?? status;
  }

  close(): void {
    this.dialogRef.close();
  }
}