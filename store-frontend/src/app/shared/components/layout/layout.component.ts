import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  user: any;
  menuItems: any[] = [];

  constructor(
  private authService: AuthService,
  private router: Router
) {
  this.user = this.authService.getUser();
  this.buildMenu();
}

buildMenu(): void {
  const role = this.user?.role;

  if (role === 'Admin') {
    this.menuItems = [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { label: 'Usuarios', icon: 'manage_accounts', route: '/users' },
      { label: 'Productos', icon: 'inventory_2', route: '/products' },
      { label: 'Categorías', icon: 'category', route: '/categories' },
      { label: 'Inventario', icon: 'warehouse', route: '/inventory' },
      { label: 'Pedidos', icon: 'shopping_cart', route: '/orders' },
      { label: 'Clientes', icon: 'people', route: '/customers' },
      { label: 'Proveedores', icon: 'local_shipping', route: '/suppliers' },
    ];
  } else if (role === 'Worker') {
    this.menuItems = [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { label: 'Productos', icon: 'inventory_2', route: '/products' },
      { label: 'Inventario', icon: 'warehouse', route: '/inventory' },
      { label: 'Pedidos', icon: 'shopping_cart', route: '/orders' },
      { label: 'Clientes', icon: 'people', route: '/customers' },
    ];
  } else if (role === 'Customer') {
    this.menuItems = [
      { label: 'Inicio', icon: 'home', route: '/dashboard' },
      { label: 'Catálogo', icon: 'store', route: '/catalog' },
      { label: 'Mis pedidos', icon: 'shopping_cart', route: '/my-orders' },
      { label: 'Mi perfil', icon: 'person', route: '/profile' },
    ];
  }
}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleLabel(): string {
    const roles: Record<string, string> = {
      'Admin': 'Administrador',
      'Worker': 'Trabajador',
      'Customer': 'Cliente'
    };
    return roles[this.user?.role] ?? this.user?.role;
  }
}