import { Injectable, Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../domain/interfaces/inventory.repository.interface';
import { InventoryItem, MovementType } from '../../domain/entities/inventory.entity';
import { CreateInventoryDto } from '../../domain/dtos/create-inventory.dto';
import { AdjustStockDto } from '../../domain/dtos/adjust-stock.dto';
import { InventoryItemNotFoundException, InsufficientStockException } from '../../domain/exceptions/inventory.exceptions';

@Injectable()
export class InventoryLogic {
  constructor(
    @Inject(IInventoryRepository)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async findAll(): Promise<InventoryItem[]> {
    return await this.inventoryRepository.findAll();
  }

  async findById(id: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) throw new InventoryItemNotFoundException(id);
    return item;
  }

  async create(dto: CreateInventoryDto): Promise<InventoryItem> {
    return await this.inventoryRepository.create({
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      stock: dto.stock,
      minStock: dto.minStock,
    });
  }

  async adjustStock(id: number, dto: AdjustStockDto): Promise<InventoryItem> {
    const item = await this.findById(id);

    if (dto.type === MovementType.OUT && item.stock < dto.quantity) {
      throw new InsufficientStockException(item.productId, item.stock, dto.quantity);
    }

    const newStock = dto.type === MovementType.IN
      ? item.stock + dto.quantity
      : dto.type === MovementType.OUT
        ? item.stock - dto.quantity
        : dto.quantity;

    await this.inventoryRepository.addMovement(id, dto.quantity, dto.type, dto.reference);
    return await this.inventoryRepository.update(id, { stock: newStock });
  }

  async reduceStock(productId: number, quantity: number, variantId?: number): Promise<void> {
    const item = variantId
      ? await this.inventoryRepository.findByProductAndVariant(productId, variantId)
      : await this.inventoryRepository.findByProduct(productId);

    if (!item) throw new InventoryItemNotFoundException(productId);
    if (item.stock < quantity) throw new InsufficientStockException(productId, item.stock, quantity);

    await this.inventoryRepository.update(item.id, { stock: item.stock - quantity });
    await this.inventoryRepository.addMovement(item.id, quantity, MovementType.OUT, 'Order confirmed');
  }

  async findByProduct(productId: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findByProduct(productId);
    if (!item) throw new InventoryItemNotFoundException(productId);
    return item;
  }

  async updateMinStock(id: number, minStock: number): Promise<InventoryItem> {
    const item = await this.findById(id);
    return await this.inventoryRepository.update(id, { minStock });
  }
}