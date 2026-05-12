import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./views/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./views/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./views/products/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./views/categories/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/orders/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./views/customers/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./views/inventory/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./views/suppliers/suppliers/suppliers.component').then(m => m.SuppliersComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/users/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./views/catalog/catalog/catalog.component').then(m => m.CatalogComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./views/my-orders/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./views/profile/profile/profile.component').then(m => m.ProfileComponent)
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];