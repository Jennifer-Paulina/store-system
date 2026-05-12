import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Order } from '../../domain/entities/order.entity';
import { TicketRepository } from '../repositories/ticket.repository';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class TicketService {
  private readonly ticketsDir: string;

  constructor(private readonly ticketRepository: TicketRepository) {
    this.ticketsDir = path.join(process.cwd(), 'tickets');
    if (!fs.existsSync(this.ticketsDir)) {
      fs.mkdirSync(this.ticketsDir, { recursive: true });
    }
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING_REVIEW': 'Pendiente de revisión',
      'CONFIRMED': 'Confirmado',
      'REJECTED': 'Rechazado',
      'CONFIRMATION_FAILED_STOCK': 'Fallo por stock insuficiente',
    };
    return labels[status] ?? status;
  }

  async generateTicket(order: Order, productNames: Record<number, string>): Promise<string> {
    const fileName = `ticket_order_${order.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.ticketsDir, fileName);
    const fileUrl = `/tickets/${fileName}`;

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('StoreSystem — Ticket de Pedido', { align: 'center' });
      doc.moveDown();

      // Info del pedido
      doc.fontSize(12).font('Helvetica');
      doc.text(`Pedido #${order.id}`);
      doc.text(`Fecha: ${order.createdAt.toLocaleDateString('es-MX')}`);
      doc.text(`Cliente ID: ${order.customerId}`);
      doc.text(`Estado: ${this.getStatusLabel(order.status)}`);
      doc.moveDown();

      // Detalle
      doc.fontSize(14).font('Helvetica-Bold').text('Detalle del pedido');
      doc.moveDown(0.5);

      // Encabezados tabla
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('ID', 50, doc.y, { width: 40, continued: false });
      const yHeader = doc.y - 15;
      doc.text('Producto', 95, yHeader, { width: 165 });
      doc.text('Cant.', 265, yHeader, { width: 50 });
      doc.text('Precio Unit.', 320, yHeader, { width: 90 });
      doc.text('Subtotal', 415, yHeader, { width: 90 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      doc.font('Helvetica').fontSize(10);
      for (const item of order.items ?? []) {
        const productName = productNames[item.productId] ?? `Producto #${item.productId}`;
        const y = doc.y;
        doc.text(`#${item.productId}`, 50, y, { width: 40 });
        doc.text(productName, 95, y, { width: 165 });
        doc.text(item.quantity.toString(), 265, y, { width: 50 });
        doc.text(`$${item.unitPrice.toFixed(2)}`, 320, y, { width: 90 });
        doc.text(`$${item.subtotal.toFixed(2)}`, 415, y, { width: 90 });
        doc.moveDown(0.5);
      }

      // Total
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });

      // Notas
      if (order.notes) {
        doc.moveDown();
        doc.fontSize(10).font('Helvetica-Oblique').text(`Notas: ${order.notes}`);
      }

      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    await this.ticketRepository.create(order.id, fileUrl);
    return fileUrl;
  }

  async getTicketPath(orderId: number): Promise<string | null> {
    const ticket = await this.ticketRepository.findByOrderId(orderId);
    if (!ticket) return null;
    return path.join(this.ticketsDir, path.basename(ticket.fileUrl));
  }
}