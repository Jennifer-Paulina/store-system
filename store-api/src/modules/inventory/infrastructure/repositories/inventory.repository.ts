import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IInventoryRepository } from '../../domain/interfaces/inventory.repository.interface';
import { InventoryItem, StockMovement, MovementType } from '../../domain/entities/inventory.entity';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<InventoryItem[]> {
    return await this.prisma.inventoryItem.findMany({
      include: { stockMovements: true },
      orderBy: { productId: 'asc' },
    }) as unknown as InventoryItem[];
  }

  async findById(id: number): Promise<InventoryItem | null> {
    return await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async findByProduct(productId: number): Promise<InventoryItem | null> {
    return await this.prisma.inventoryItem.findFirst({
      where: { productId, variantId: null },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async findByProductAndVariant(productId: number, variantId: number): Promise<InventoryItem | null> {
    return await this.prisma.inventoryItem.findFirst({
      where: { productId, variantId },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'stockMovements'>): Promise<InventoryItem> {
    return await this.prisma.inventoryItem.create({
      data: item,
    }) as unknown as InventoryItem;
  }

  async update(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { id: _, createdAt, updatedAt, stockMovements, ...data } = item as any;
  return await this.prisma.inventoryItem.update({
    where: { id },
    data,
  }) as unknown as InventoryItem;
 }

  async addMovement(inventoryItemId: number, quantity: number, type: MovementType, reference?: string): Promise<StockMovement> {
    return await this.prisma.stockMovement.create({
      data: {
        inventoryItemId,
        quantity,
        type,
        reference: reference ?? null,
      },
    }) as unknown as StockMovement;
  }
}