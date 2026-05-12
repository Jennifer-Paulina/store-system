import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';

export interface TicketRecord {
  id: number;
  fileUrl: string;
  createdAt: Date;
  orderId: number;
}

@Injectable()
export class TicketRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async create(orderId: number, fileUrl: string): Promise<TicketRecord> {
    return await this.prismaWrite.ticket.create({
      data: { orderId, fileUrl },
    });
  }

  async findByOrderId(orderId: number): Promise<TicketRecord | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.ticket.findUnique({
      where: { orderId },
    });
  }
}