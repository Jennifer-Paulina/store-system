import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';

@Injectable()
export class InventoryTasks {
  private readonly logger = new Logger(InventoryTasks.name);

  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService,
  ) {}

  @Cron('0 */2 * * * *') // Cada 2 minutos
  //@Cron('0 */10 * * * *') // Cada 10 minutos
  //@Cron('0 * * * * *') // Cada 1 minuto
  async checkLowStock(): Promise<void> {
    this.logger.log('Iniciando verificación de stock bajo...');

    try {
      this.prismaRead.checkAvailability();
    } catch {
      this.logger.warn('Réplica no disponible. Omitiendo verificación de stock bajo.');
      return;
    }

    try {
      const items = await this.prismaRead.inventoryItem.findMany();

      let updatedCount = 0;

      for (const item of items) {
        const isLowStock = item.stock <= item.minStock;
        const currentIsLowStock = (item as any).isLowStock ?? false;

        if (currentIsLowStock !== isLowStock) {
          await this.prismaWrite.inventoryItem.update({
            where: { id: item.id },
            data: { isLowStock },
          });
          updatedCount++;

          if (isLowStock) {
            this.logger.warn(
              `Stock bajo detectado: Producto ID ${item.productId} — Stock: ${item.stock}, Mínimo: ${item.minStock}`,
            );
          } else {
            this.logger.log(
              `Stock normalizado: Producto ID ${item.productId} — Stock: ${item.stock}`,
            );
          }
        }
      }

      // Cancelar pedidos pendientes con productos sin stock
      const zeroStockProducts = items
        .filter(i => i.stock === 0)
        .map(i => i.productId);

      if (zeroStockProducts.length > 0) {
        const affectedOrders = await this.prismaRead.order.findMany({
          where: {
            status: 'PENDING_REVIEW',
            items: {
              some: {
                productId: { in: zeroStockProducts },
              },
            },
          },
        });

        for (const order of affectedOrders) {
          await this.prismaWrite.order.update({
            where: { id: order.id },
            data: { status: 'CONFIRMATION_FAILED_STOCK' },
          });
          this.logger.warn(
            `Pedido #${order.id} cancelado por stock insuficiente en productos: ${zeroStockProducts.join(', ')}`,
          );
        }
      }

      this.logger.log(
        `Verificación completada. Items actualizados: ${updatedCount}`,
      );
    } catch (error) {
      this.logger.error('Error en verificación de stock bajo:', error);
    }
  }
}