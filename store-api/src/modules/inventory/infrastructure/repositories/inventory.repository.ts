import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '../../../../infrastructure/database/prisma-write.service';
import { PrismaReadService } from '../../../../infrastructure/database/prisma-read.service';
import { IInventoryRepository } from '../../domain/interfaces/inventory.repository.interface';
import { InventoryItem, StockMovement, MovementType } from '../../domain/entities/inventory.entity';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findAll(): Promise<InventoryItem[]> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.inventoryItem.findMany({
      include: { stockMovements: true },
      orderBy: { productId: 'asc' },
    }) as unknown as InventoryItem[];
  }

  async findById(id: number): Promise<InventoryItem | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.inventoryItem.findUnique({
      where: { id },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async findByProduct(productId: number): Promise<InventoryItem | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.inventoryItem.findFirst({
      where: { productId, variantId: null },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async findByProductAndVariant(productId: number, variantId: number): Promise<InventoryItem | null> {
    this.prismaRead.checkAvailability();
    return await this.prismaRead.inventoryItem.findFirst({
      where: { productId, variantId },
      include: { stockMovements: true },
    }) as unknown as InventoryItem | null;
  }

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'stockMovements'>): Promise<InventoryItem> {
    return await this.prismaWrite.inventoryItem.create({
      data: item,
    }) as unknown as InventoryItem;
  }

  async update(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const { id: _, createdAt, updatedAt, stockMovements, ...data } = item as any;
    return await this.prismaWrite.inventoryItem.update({
      where: { id },
      data,
    }) as unknown as InventoryItem;
  }

  async addMovement(inventoryItemId: number, quantity: number, type: MovementType, reference?: string): Promise<StockMovement> {
    return await this.prismaWrite.stockMovement.create({
      data: {
        inventoryItemId,
        quantity,
        type,
        reference: reference ?? null,
      },
    }) as unknown as StockMovement;
  }
}