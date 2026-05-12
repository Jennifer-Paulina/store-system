import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/exceptions/http-exception.filter';

describe('StoreAPI (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── CATEGORIES ───────────────────────────────────────────────

  describe('Categories', () => {
    let categoryId: number;

    it('POST /categories — Create_Ok_DatosValidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Papelería', description: 'Productos de papelería' })
        .expect(201);

      expect(response.body.name).toBe('Papelería');
      categoryId = response.body.id;
    });

    it('POST /categories — Create_BadRequest_NombreDuplicado', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Papelería' })
        .expect(400);

      expect(response.body.message).toBe("La categoría 'Papelería' ya existe.");
    });

    it('GET /categories — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /categories/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
    });

    it('GET /categories/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/99999')
        .expect(404);

      expect(response.body.message).toBe('Categoría con ID 99999 no encontrada.');
    });

    it('PUT /categories/:id — Update_Ok', async () => {
      const response = await request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .send({ name: 'Papelería Actualizada' })
        .expect(200);

      expect(response.body.name).toBe('Papelería Actualizada');
    });

    it('DELETE /categories/:id — Delete_Ok', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);
    });

    it('DELETE /categories/:id — Delete_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .delete('/categories/99999')
        .expect(404);

      expect(response.body.message).toBe('Categoría con ID 99999 no encontrada.');
    });

    it('POST /categories — Create_BadRequest_SinNombre', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({ description: 'Sin nombre' })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('PUT /categories/:id — Update_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .put('/categories/99999')
        .send({ name: 'No existe' })
        .expect(404);
      expect(response.body.message).toBe('Categoría con ID 99999 no encontrada.');
    });

    it('PUT /categories/:id — Update_BadRequest_NombreDuplicado', async () => {
      const cat1 = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatDup1_${Date.now()}` });
      const cat2 = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatDup2_${Date.now()}` });
      const response = await request(app.getHttpServer())
        .put(`/categories/${cat1.body.id}`)
        .send({ name: cat2.body.name })
        .expect(400);
      expect(response.body.message).toContain('ya existe');
      await request(app.getHttpServer()).delete(`/categories/${cat1.body.id}`);
      await request(app.getHttpServer()).delete(`/categories/${cat2.body.id}`);
    });

    it('PUT /categories/:id — Update_Ok_IsActive', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatActive_${Date.now()}` });
      const response = await request(app.getHttpServer())
        .put(`/categories/${cat.body.id}`)
        .send({ isActive: false })
        .expect(200);
      expect(response.body.isActive).toBe(false);
      await request(app.getHttpServer()).delete(`/categories/${cat.body.id}`);
    });

  });

  
  // ─── SUPPLIERS ────────────────────────────────────────────────

  describe('Suppliers', () => {
    let supplierId: number;

    it('POST /suppliers — Create_Ok_DatosValidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({ name: 'Proveedor Test', phone: '6181234567' })
        .expect(201);

      expect(response.body.name).toBe('Proveedor Test');
      supplierId = response.body.id;
    });

    it('GET /suppliers — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/suppliers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /suppliers/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(200);

      expect(response.body.id).toBe(supplierId);
    });

    it('GET /suppliers/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/suppliers/99999')
        .expect(404);

      expect(response.body.message).toBe('Proveedor con ID 99999 no encontrado.');
    });

    it('PUT /suppliers/:id — Update_Ok', async () => {
      const response = await request(app.getHttpServer())
        .put(`/suppliers/${supplierId}`)
        .send({ name: 'Proveedor Actualizado' })
        .expect(200);

      expect(response.body.name).toBe('Proveedor Actualizado');
    });

    it('DELETE /suppliers/:id — Delete_Ok', async () => {
      await request(app.getHttpServer())
        .delete(`/suppliers/${supplierId}`)
        .expect(200);
    });

    it('DELETE /suppliers/:id — Delete_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .delete('/suppliers/99999')
        .expect(404);
      expect(response.body.message).toBe('Proveedor con ID 99999 no encontrado.');
    });

    it('POST /suppliers — Create_BadRequest_SinNombre', async () => {
      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({ phone: '6181234567' })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('POST /suppliers — Create_Ok_TodosLosCampos', async () => {
      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: `Proveedor Completo_${Date.now()}`,
          contact: 'Juan Pérez',
          phone: '6181234567',
          email: `prov_${Date.now()}@gmail.com`,
          description: 'Proveedor de prueba completo',
        })
        .expect(201);
      expect(response.body.contact).toBe('Juan Pérez');
      await request(app.getHttpServer()).delete(`/suppliers/${response.body.id}`);
    });

    it('PUT /suppliers/:id — Update_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .put('/suppliers/99999')
        .send({ name: 'No existe' })
        .expect(404);
      expect(response.body.message).toBe('Proveedor con ID 99999 no encontrado.');
    });

    it('PUT /suppliers/:id — Update_Ok_Desactivar', async () => {
      const sup = await request(app.getHttpServer())
        .post('/suppliers')
        .send({ name: `SupInactive_${Date.now()}` });
      const response = await request(app.getHttpServer())
        .put(`/suppliers/${sup.body.id}`)
        .send({ isActive: false })
        .expect(200);
      expect(response.body.isActive).toBe(false);
      await request(app.getHttpServer()).delete(`/suppliers/${sup.body.id}`);
    });

  });

  // ─── CUSTOMERS ────────────────────────────────────────────────

  describe('Customers', () => {
    let customerId: number;

    it('POST /customers — Create_Ok_DatosValidos', async () => {
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        authUserId: Math.floor(Math.random() * 100000),
        name: 'Cliente Test',
        email: `test_${Date.now()}@gmail.com`,
      })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    customerId = response.body.id;
  });

    it('GET /customers — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('PATCH /customers/:id/approve — Approve_Ok', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/customers/${customerId}/approve`)
        .expect(200);

      expect(response.body.status).toBe('ACTIVE');
    });

    it('PATCH /customers/:id/deactivate — Deactivate_Ok', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/customers/${customerId}/deactivate`)
        .expect(200);

      expect(response.body.status).toBe('INACTIVE');
    });

    it('GET /customers/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/99999')
        .expect(404);

      expect(response.body.message).toBe('Cliente con ID 99999 no encontrado.');
    });

    it('POST /customers — Create_BadRequest_EmailDuplicado', async () => {
      const email = `dup_${Date.now()}@gmail.com`;
      await request(app.getHttpServer())
        .post('/customers')
        .send({ authUserId: Math.floor(Math.random() * 100000), name: 'Dup', email });
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ authUserId: Math.floor(Math.random() * 100000), name: 'Dup2', email })
        .expect(400);
      expect(response.body.message).toContain('ya existe');
    });

    it('POST /customers — Create_BadRequest_SinEmail', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ authUserId: 1, name: 'Sin Email' })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('POST /customers — Create_BadRequest_EmailInvalido', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ authUserId: 1, name: 'Email Invalido', email: 'no-es-un-email' })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('PUT /customers/:id — Update_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .put('/customers/99999')
        .send({ name: 'No existe' })
        .expect(404);
      expect(response.body.message).toBe('Cliente con ID 99999 no encontrado.');
    });

    it('PATCH /customers/:id/approve — Approve_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .patch('/customers/99999/approve')
        .expect(404);
      expect(response.body.message).toBe('Cliente con ID 99999 no encontrado.');
    });

    it('PATCH /customers/:id/deactivate — Deactivate_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .patch('/customers/99999/deactivate')
        .expect(404);
      expect(response.body.message).toBe('Cliente con ID 99999 no encontrado.');
    });

    it('GET /customers/:id/orders — GetOrders_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/99999/orders')
        .expect(404);
      expect(response.body.message).toBe('Cliente con ID 99999 no encontrado.');
    });
    it('GET /customers/auth/:authUserId — FindByAuthUserId_Ok', async () => {
      const authUserId = Math.floor(Math.random() * 100000);
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId,
          name: 'Cliente Auth',
          email: `auth_${Date.now()}@gmail.com`,
        });
      const response = await request(app.getHttpServer())
        .get(`/customers/auth/${authUserId}`)
        .expect(200);
      expect(response.body.authUserId).toBe(authUserId);
      await request(app.getHttpServer()).delete(`/customers/${cust.body.id}`);
    });

    it('GET /customers/auth/:authUserId — FindByAuthUserId_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/auth/99999')
        .expect(404);
      expect(response.body.message).toBeDefined();
    });

  });

  // ─── PRODUCTS ─────────────────────────────────────────────────

  describe('Products', () => {
    let productId: number;
    let categoryId: number;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `Categoria_${Date.now()}` });
      categoryId = cat.body.id;
    });

    it('POST /products — Create_Ok_DatosValidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Producto Test', price: 99.99, categoryId })
        .expect(201);

      expect(response.body.name).toBe('Producto Test');
      productId = response.body.id;
    });

    it('GET /products — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /products/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
    });

    it('GET /products/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);

      expect(response.body.message).toBe('Producto con ID 99999 no encontrado.');
    });

    it('POST /products/:id/variants — AddVariant_Ok', async () => {
      const response = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .send({ name: 'Color', value: 'Rojo' })
        .expect(201);

      expect(response.body.message).toBe('Variante agregada correctamente.');
    });

    it('PUT /products/:id — Update_Ok', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .send({ name: 'Producto Actualizado', price: 149.99, categoryId })
        .expect(200);

      expect(response.body.name).toBe('Producto Actualizado');
    });

    it('POST /products — Create_BadRequest_SinPrecio', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatProd_${Date.now()}` });
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Sin precio', categoryId: cat.body.id })
        .expect(400);
      expect(response.body.message).toBeDefined();
      await request(app.getHttpServer()).delete(`/categories/${cat.body.id}`);
    });

    it('POST /products — Create_BadRequest_SinCategoria', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Sin categoria', price: 10 })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('POST /products — Create_BadRequest_PrecioNegativo', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatNeg_${Date.now()}` });
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Precio negativo', price: -10, categoryId: cat.body.id })
        .expect(400);
      expect(response.body.message).toBeDefined();
      await request(app.getHttpServer()).delete(`/categories/${cat.body.id}`);
    });

    it('PUT /products/:id — Update_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .put('/products/99999')
        .send({ name: 'No existe' })
        .expect(404);
      expect(response.body.message).toBe('Producto con ID 99999 no encontrado.');
    });

    it('PUT /products/:id — Update_Ok_Desactivar', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatDeact_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdDeact_${Date.now()}`, price: 50, categoryId: cat.body.id });
      const response = await request(app.getHttpServer())
        .put(`/products/${prod.body.id}`)
        .send({ isActive: false })
        .expect(200);
      expect(response.body.isActive).toBe(false);
    });

    it('POST /products/:id/variants — AddVariant_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/99999/variants')
        .send({ name: 'Color', value: 'Azul' })
        .expect(404);
      expect(response.body.message).toBe('Producto con ID 99999 no encontrado.');
    });

    it('POST /products/:id/variants — AddVariant_BadRequest_SinNombre', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatVar_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdVar_${Date.now()}`, price: 50, categoryId: cat.body.id });
      const response = await request(app.getHttpServer())
        .post(`/products/${prod.body.id}/variants`)
        .send({ value: 'Rojo' })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('DELETE /products/:id/variants/:variantId — RemoveVariant_Ok', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatRemVar_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdRemVar_${Date.now()}`, price: 50, categoryId: cat.body.id });
      await request(app.getHttpServer())
        .post(`/products/${prod.body.id}/variants`)
        .send({ name: 'Talla', value: 'M' });
      const prodWithVariants = await request(app.getHttpServer())
        .get(`/products/${prod.body.id}`);
      const variantId = prodWithVariants.body.variants[0]?.id;
      if (variantId) {
        const response = await request(app.getHttpServer())
          .delete(`/products/${prod.body.id}/variants/${variantId}`)
          .expect(200);
        expect(response.body.message).toBe('Variante eliminada correctamente.');
      }
    });

    it('GET /products?supplierId — FindBySupplier_Ok', async () => {
      const sup = await request(app.getHttpServer())
        .post('/suppliers')
        .send({ name: `SupProd_${Date.now()}` });
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatSup_${Date.now()}` });
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdSup_${Date.now()}`, price: 50, categoryId: cat.body.id, supplierId: sup.body.id });
      const response = await request(app.getHttpServer())
        .get(`/products?supplierId=${sup.body.id}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('DELETE /products/:id/variants/:variantId — RemoveVariant_NotFound', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatVarNF_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdVarNF_${Date.now()}`, price: 50, categoryId: cat.body.id });

      const response = await request(app.getHttpServer())
        .delete(`/products/${prod.body.id}/variants/99999`)
        .expect(404);

      expect(response.body.message).toContain('99999');
    });

  });

  // ─── INVENTORY ────────────────────────────────────────────────

  describe('Inventory', () => {
    let inventoryId: number;
    let productId: number;
    let categoryId: number;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatInv_${Date.now()}` });
      categoryId = cat.body.id;

      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdInv_${Date.now()}`, price: 50, categoryId });
      productId = prod.body.id;
    });

    it('POST /inventory — Create_Ok', async () => {
      const response = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId, stock: 100, minStock: 10 })
        .expect(201);

      expect(response.body.stock).toBe(100);
      inventoryId = response.body.id;
    });

    it('GET /inventory — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('PATCH /inventory/:id/adjust — AdjustStock_Ok_IN', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/inventory/${inventoryId}/adjust`)
        .send({ quantity: 50, type: 'IN', reference: 'Compra test' })
        .expect(200);

      expect(response.body.stock).toBe(150);
    });

    it('PATCH /inventory/:id/adjust — AdjustStock_Ok_OUT', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/inventory/${inventoryId}/adjust`)
        .send({ quantity: 20, type: 'OUT', reference: 'Venta test' })
        .expect(200);

      expect(response.body.stock).toBe(130);
    });

    it('PATCH /inventory/:id/adjust — AdjustStock_BadRequest_StockInsuficiente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/inventory/${inventoryId}/adjust`)
        .send({ quantity: 99999, type: 'OUT' })
        .expect(400);

      expect(response.body.message).toContain('Stock insuficiente');
    });

    it('POST /inventory — Create_BadRequest_SinProducto', async () => {
      const response = await request(app.getHttpServer())
        .post('/inventory')
        .send({ stock: 100, minStock: 10 })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('POST /inventory — Create_BadRequest_StockNegativo', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatInvNeg_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdInvNeg_${Date.now()}`, price: 50, categoryId: cat.body.id });
      const response = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: prod.body.id, stock: -1, minStock: 0 })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('PATCH /inventory/:id/adjust — AdjustStock_Ok_ADJUSTMENT', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatAdj_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdAdj_${Date.now()}`, price: 50, categoryId: cat.body.id });
      const inv = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: prod.body.id, stock: 100, minStock: 10 });
      const response = await request(app.getHttpServer())
        .patch(`/inventory/${inv.body.id}/adjust`)
        .send({ quantity: 200, type: 'ADJUSTMENT' })
        .expect(200);
      expect(response.body.stock).toBe(200);
    });

    it('PATCH /inventory/:id/adjust — AdjustStock_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .patch('/inventory/99999/adjust')
        .send({ quantity: 10, type: 'IN' })
        .expect(404);
      expect(response.body.message).toContain('99999');
    });

    it('GET /inventory/product/:productId — FindByProduct_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/product/99999')
        .expect(404);
      expect(response.body.message).toContain('99999');
    });
    it('PATCH /inventory/:id/min-stock — UpdateMinStock_Ok', async () => {
  const cat = await request(app.getHttpServer())
    .post('/categories')
    .send({ name: `CatMinStock_${Date.now()}` });
  const prod = await request(app.getHttpServer())
    .post('/products')
    .send({ name: `ProdMinStock_${Date.now()}`, price: 50, categoryId: cat.body.id });
  const inv = await request(app.getHttpServer())
    .post('/inventory')
    .send({ productId: prod.body.id, stock: 100, minStock: 10 });

  const response = await request(app.getHttpServer())
    .patch(`/inventory/${inv.body.id}/min-stock`)
    .send({ minStock: 20 })
    .expect(200);

  expect(response.body.minStock).toBe(20);
});

it('PATCH /inventory/:id/min-stock — UpdateMinStock_NotFound', async () => {
  const response = await request(app.getHttpServer())
    .patch('/inventory/99999/min-stock')
    .send({ minStock: 10 })
    .expect(404);

  expect(response.body.message).toContain('99999');
});
    
  // ─── ORDERS ───────────────────────────────────────────────────

  describe('Orders', () => {
    let orderId: number;
    let customerId: number;
    let productId: number;
    let categoryId: number;
    let inventoryId: number;

    beforeAll(async () => {
      // Crear categoría
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatOrder_${Date.now()}` });
      categoryId = cat.body.id;

      // Crear producto
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdOrder_${Date.now()}`, price: 100, categoryId });
      productId = prod.body.id;

      // Crear inventario
      const inv = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId, stock: 50, minStock: 5 });
      inventoryId = inv.body.id;

      // Crear cliente
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Orden',
          email: `order_${Date.now()}@gmail.com`,
        });
      customerId = cust.body.id;

      // Aprobar el cliente para que pueda hacer pedidos
      await request(app.getHttpServer())
        .patch(`/customers/${customerId}/approve`);
      });

    it('POST /orders — Create_Ok_DatosValidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId,
          notes: 'Pedido de prueba',
          items: [{ productId, quantity: 2 }],
        })
        .expect(201);

      expect(response.body.status).toBe('PENDING_REVIEW');
      expect(response.body.total).toBe(200);
      orderId = response.body.id;
    });

    it('GET /orders — FindAll_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /orders?customerId — FindByCustomer_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders?customerId=${customerId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /orders/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
    });

    it('GET /orders/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/99999')
        .expect(404);

      expect(response.body.message).toBe('Pedido con ID 99999 no encontrado.');
    });

    it('PATCH /orders/:id/reject — Reject_Ok', async () => {
      // Crear otro pedido para rechazar
      const newOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId,
          items: [{ productId, quantity: 1 }],
        });

      const response = await request(app.getHttpServer())
        .patch(`/orders/${newOrder.body.id}/reject`)
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
    });

    it('PATCH /orders/:id/reject — Reject_BadRequest_NoEsPendiente', async () => {
      // Intentar rechazar un pedido ya rechazado
      const newOrder = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId,
          items: [{ productId, quantity: 1 }],
        });

      await request(app.getHttpServer())
        .patch(`/orders/${newOrder.body.id}/reject`);

      const response = await request(app.getHttpServer())
        .patch(`/orders/${newOrder.body.id}/reject`)
        .expect(400);

      expect(response.body.message).toContain('no está en estado PENDING_REVIEW');
    });

    it('PATCH /orders/:id/confirm — Confirm_Ok', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/confirm`)
        .expect(200);

      expect(response.body.status).toBe('CONFIRMED');
    });

    it('PATCH /orders/:id/confirm — Confirm_BadRequest_NoEsPendiente', async () => {
      const response = await request(app.getHttpServer())
          .patch(`/orders/${orderId}/confirm`)
          .expect(400);

        expect(response.body.message).toContain('no está en estado PENDING_REVIEW');
      });
    });
      it('POST /orders — Create_BadRequest_ProductoInactivo', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatInact_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdInact_${Date.now()}`, price: 100, categoryId: cat.body.id });
      await request(app.getHttpServer())
        .put(`/products/${prod.body.id}`)
        .send({ isActive: false });
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Inact',
          email: `inact_${Date.now()}@gmail.com`,
        });
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: cust.body.id, items: [{ productId: prod.body.id, quantity: 1 }] })
        .expect(400);
      expect(response.body.message).toContain('no está activo');
    });

    it('PATCH /orders/:id/confirm — Confirm_Ok_ConVariante', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatVar_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdVar_${Date.now()}`, price: 50, categoryId: cat.body.id });
      await request(app.getHttpServer())
        .post(`/products/${prod.body.id}/variants`)
        .send({ name: 'Color', value: 'Rojo' });
      const prodWithVariants = await request(app.getHttpServer())
        .get(`/products/${prod.body.id}`);
      const variantId = prodWithVariants.body.variants[0]?.id;
      await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: prod.body.id, variantId, stock: 10, minStock: 1 });
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Variante',
          email: `variant_${Date.now()}@gmail.com`,
        });
        // Aprobar el cliente
        await request(app.getHttpServer())
      .   patch(`/customers/${cust.body.id}/approve`);
      const order = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: cust.body.id, items: [{ productId: prod.body.id, variantId, quantity: 1 }] });
      const response = await request(app.getHttpServer())
        .patch(`/orders/${order.body.id}/confirm`)
        .expect(200);
      expect(response.body.status).toBe('CONFIRMED');
    });

      it('POST /orders — Create_BadRequest_ClienteNoActivo', async () => {
    const cat = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: `CatClienteInact_${Date.now()}` });
    const prod = await request(app.getHttpServer())
      .post('/products')
      .send({ name: `ProdClienteInact_${Date.now()}`, price: 100, categoryId: cat.body.id });
    await request(app.getHttpServer())
      .post('/inventory')
      .send({ productId: prod.body.id, stock: 10, minStock: 1 });
    const cust = await request(app.getHttpServer())
      .post('/customers')
      .send({
        authUserId: Math.floor(Math.random() * 100000),
        name: 'Cliente Inactivo',
        email: `clienteinact_${Date.now()}@gmail.com`,
      });

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({ customerId: cust.body.id, items: [{ productId: prod.body.id, quantity: 1 }] })
      .expect(400);

    expect(response.body.message).toContain('no está activo');
  });
  });

  // ─── NUEVOS ENDPOINTS ─────────────────────────────────────────

  describe('Products', () => {
    let categoryId: number;
    let productId: number;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatFilter_${Date.now()}` });
      categoryId = cat.body.id;

      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdFilter_${Date.now()}`, price: 50, categoryId });
      productId = prod.body.id;
    });

    it('GET /products?categoryId — FindByCategory_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products?categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /products/:id/variants — GetVariants_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}/variants`)
        .expect(200);

      expect(response.body.id).toBe(productId);
    });

    it('DELETE /products/:id — Delete_Ok', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);
    });

    it('DELETE /products/:id — Delete_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);

      expect(response.body.message).toBe('Producto con ID 99999 no encontrado.');
    });
  });

  describe('Inventory', () => {
    let productId: number;
    let categoryId: number;
    let inventoryId: number;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatInv2_${Date.now()}` });
      categoryId = cat.body.id;

      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdInv2_${Date.now()}`, price: 50, categoryId });
      productId = prod.body.id;

      const inv = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId, stock: 100, minStock: 10 });
      inventoryId = inv.body.id;
    });

    it('GET /inventory/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/${inventoryId}`)
        .expect(200);

      expect(response.body.id).toBe(inventoryId);
    });

    it('GET /inventory/:id — FindById_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/99999')
        .expect(404);

      expect(response.body.message).toContain('99999');
    });

    it('GET /inventory/product/:productId — FindByProduct_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/product/${productId}`)
        .expect(200);

      expect(response.body.productId).toBe(productId);
    });
  });

  describe('Customers', () => {
    let customerId: number;

    beforeAll(async () => {
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Orders',
          email: `orders_${Date.now()}@gmail.com`,
        });
      customerId = cust.body.id;
    });

    it('GET /customers/:id — FindById_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .expect(200);

      expect(response.body.id).toBe(customerId);
    });

    it('PUT /customers/:id — Update_Ok', async () => {
      const response = await request(app.getHttpServer())
        .put(`/customers/${customerId}`)
        .send({ name: 'Cliente Actualizado' })
        .expect(200);
        
      expect(response.body.name).toBe('Cliente Actualizado');
    });

    it('GET /customers/:id/orders — GetOrders_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${customerId}/orders`)
        .expect(200);

      expect(response.body.customerId).toBe(customerId);
    });

    it('DELETE /customers/:id — Delete_Ok', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${customerId}`)
        .expect(200);
    });
  });

  describe('Orders — ticket endpoint', () => {
    let orderId: number;
    let customerId: number;
    let productId: number;
    let categoryId: number;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatTicket_${Date.now()}` });
      categoryId = cat.body.id;

      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdTicket_${Date.now()}`, price: 100, categoryId });
      productId = prod.body.id;

      await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId, stock: 50, minStock: 5 });

      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Ticket',
          email: `ticket_${Date.now()}@gmail.com`,
        });
      customerId = cust.body.id;

      await request(app.getHttpServer())
        .patch(`/customers/${cust.body.id}/approve`);

      const order = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId, items: [{ productId, quantity: 1 }] });
      orderId = order.body.id;

      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/confirm`);
    });

    it('GET /orders/:id/ticket — DownloadTicket_Ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}/ticket`)
        .expect(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('GET /orders/:id/ticket — DownloadTicket_NotFound', async () => {
      const order = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId, items: [{ productId, quantity: 1 }] });

      const response = await request(app.getHttpServer())
        .get(`/orders/${order.body.id}/ticket`)
        .expect(404);

      expect(response.body.message).toBe('Ticket no encontrado para este pedido.');
    });

    it('POST /orders — Create_BadRequest_SinItems', async () => {
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente SinItems',
          email: `noitems_${Date.now()}@gmail.com`,
        });
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: cust.body.id, items: [] })
        .expect(400);
      expect(response.body.message).toBeDefined();
    });

    it('POST /orders — Create_BadRequest_ProductoNoExiste', async () => {
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente ProdNoExiste',
          email: `noprod_${Date.now()}@gmail.com`,
        });

      await request(app.getHttpServer()).patch(`/customers/${cust.body.id}/approve`);
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: cust.body.id, items: [{ productId: 99999, quantity: 1 }] })
        .expect(404);
      expect(response.body.message).toContain('99999');
    });

    it('PATCH /orders/:id/reject — Reject_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .patch('/orders/99999/reject')
        .expect(404);
      expect(response.body.message).toBe('Pedido con ID 99999 no encontrado.');
    });

    it('PATCH /orders/:id/confirm — Confirm_NotFound', async () => {
      const response = await request(app.getHttpServer())
        .patch('/orders/99999/confirm')
        .expect(404);
      expect(response.body.message).toBe('Pedido con ID 99999 no encontrado.');
    });

    it('PATCH /orders/:id/confirm — Confirm_BadRequest_StockInsuficiente', async () => {
      const cat = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: `CatStock_${Date.now()}` });
      const prod = await request(app.getHttpServer())
        .post('/products')
        .send({ name: `ProdStock_${Date.now()}`, price: 100, categoryId: cat.body.id });
      await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: prod.body.id, stock: 1, minStock: 0 });
      const cust = await request(app.getHttpServer())
        .post('/customers')
        .send({
          authUserId: Math.floor(Math.random() * 100000),
          name: 'Cliente Stock',
          email: `stock_${Date.now()}@gmail.com`,
        });
      await request(app.getHttpServer()).patch(`/customers/${cust.body.id}/approve`);
      const order = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: cust.body.id, items: [{ productId: prod.body.id, quantity: 99999 }] });
      const response = await request(app.getHttpServer())
        .patch(`/orders/${order.body.id}/confirm`)
        .expect(400);
      expect(response.body.message).toContain('Stock insuficiente');
    });
  });
});