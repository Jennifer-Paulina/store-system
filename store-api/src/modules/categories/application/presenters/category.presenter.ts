import { Category } from '../../domain/entities/category.entity';

export class CategoryPresenter {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;

  static from(category: Category): CategoryPresenter {
    const presenter = new CategoryPresenter();
    presenter.id = category.id;
    presenter.name = category.name;
    presenter.description = category.description;
    presenter.isActive = category.isActive;
    presenter.createdAt = category.createdAt;
    return presenter;
  }

  static fromMany(categories: Category[]): CategoryPresenter[] {
    return categories.map((c) => CategoryPresenter.from(c));
  }
}