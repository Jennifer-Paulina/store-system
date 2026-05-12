import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/interfaces/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from '../../domain/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../domain/dtos/update-category.dto';
import { CategoryNotFoundException, CategoryAlreadyExistsException } from '../../domain/exceptions/category.exceptions';

@Injectable()
export class CategoryLogic {
  constructor(
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundException(id);
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findByName(dto.name);
    if (exists) throw new CategoryAlreadyExistsException(dto.name);

    return await this.categoryRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      isActive: true,
    });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);
    if (dto.name) {
      const exists = await this.categoryRepository.findByName(dto.name);
      if (exists && exists.id !== id)
        throw new CategoryAlreadyExistsException(dto.name);
    }
    return await this.categoryRepository.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.categoryRepository.delete(id);
  }
}