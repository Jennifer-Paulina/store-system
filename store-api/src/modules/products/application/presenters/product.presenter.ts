import { Product, ProductVariant } from '../../domain/entities/product.entity';

export class ProductVariantPresenter {
  id: number;
  name: string;
  value: string;

  static from(variant: ProductVariant): ProductVariantPresenter {
    const presenter = new ProductVariantPresenter();
    presenter.id = variant.id;
    presenter.name = variant.name;
    presenter.value = variant.value;
    return presenter;
  }
}

export class ProductPresenter {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  categoryId: number;
  supplierId?: number | null;
  variants: ProductVariantPresenter[];
  createdAt: Date;

  static from(product: Product): ProductPresenter {
    const presenter = new ProductPresenter();
    presenter.id = product.id;
    presenter.name = product.name;
    presenter.description = product.description;
    presenter.price = product.price;
    presenter.isActive = product.isActive;
    presenter.categoryId = product.categoryId;
    presenter.supplierId = product.supplierId;
    presenter.variants = product.variants?.map(ProductVariantPresenter.from) ?? [];
    presenter.createdAt = product.createdAt;
    return presenter;
  }

  static fromMany(products: Product[]): ProductPresenter[] {
    return products.map((p) => ProductPresenter.from(p));
  }
}