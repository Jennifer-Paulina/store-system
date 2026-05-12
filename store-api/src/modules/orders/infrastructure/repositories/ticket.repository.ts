import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface TicketRecord {
  id: number;
  fileUrl: string;
  createdAt: Date;
  orderId: number;
}

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(orderId: number, fileUrl: string): Promise<TicketRecord> {
    return await this.prisma.ticket.create({
      data: { orderId, fileUrl },
    });
  }

  async findByOrderId(orderId: number): Promise<TicketRecord | null> {
    return await this.prisma.ticket.findUnique({
      where: { orderId },
    });
  }
}