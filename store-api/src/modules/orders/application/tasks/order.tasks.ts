import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';

@Injectable()
export class OrderTasks {
  private readonly logger = new Logger(OrderTasks.name);

  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService,
  ) {}

  @Cron('0 0 * * * *') // Cada hora
  //@Cron('0 * * * * *') // Cada 1 minuto
  async cleanAbandonedOrders(): Promise<void> {
    this.logger.log('Iniciando limpieza de pedidos abandonados...');

    try {
      this.prismaRead.checkAvailability();
    } catch {
      this.logger.warn('Réplica no disponible. Omitiendo limpieza de pedidos abandonados.');
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 48);

      const abandonedOrders = await this.prismaRead.order.findMany({
        where: {
          status: 'PENDING_REVIEW',
          createdAt: { lt: cutoffDate },
        },
      });

      if (abandonedOrders.length === 0) {
        this.logger.log('No se encontraron pedidos abandonados.');
        return;
      }

      for (const order of abandonedOrders) {
        // Validar que el pedido sigue siendo vulnerable (datos consistentes)
        if (order.status !== 'PENDING_REVIEW') {
          this.logger.warn(`Pedido #${order.id} ya no está en PENDING_REVIEW, omitiendo.`);
          continue;
        }

        await this.prismaWrite.order.update({
          where: { id: order.id },
          data: { status: 'REJECTED' },
        });

        this.logger.warn(
          `Pedido #${order.id} rechazado por abandono. Creado: ${order.createdAt.toISOString()}`,
        );
      }

      this.logger.log(
        `Limpieza completada. Pedidos rechazados: ${abandonedOrders.length}`,
      );
    } catch (error) {
      this.logger.error('Error en limpieza de pedidos abandonados:', error);
    }
  }
}