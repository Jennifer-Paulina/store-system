import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoryLogic } from '../logic/category.logic';
import { CategoryPresenter } from '../presenters/category.presenter';
import { CreateCategoryDto } from '../../domain/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../domain/dtos/update-category.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryLogic: CategoryLogic) {}

  @Get()
  async findAll(): Promise<CategoryPresenter[]> {
    const categories = await this.categoryLogic.findAll();
    return CategoryPresenter.fromMany(categories);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CategoryPresenter> {
    const category = await this.categoryLogic.findById(id);
    return CategoryPresenter.from(category);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryPresenter> {
    const category = await this.categoryLogic.create(dto);
    return CategoryPresenter.from(category);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryPresenter> {
    const category = await this.categoryLogic.update(id, dto);
    return CategoryPresenter.from(category);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.categoryLogic.delete(id);
    return { message: 'Categoría eliminada correctamente.' };
  }
}