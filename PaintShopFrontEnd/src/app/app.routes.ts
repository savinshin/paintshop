import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { HomePageComponent } from './features/home/home.page';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomePageComponent,
        title: 'Автоэмали и автозапчасти — Барановичи | Главная',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.page').then((m) => m.AboutPageComponent),
        title: 'О нас',
      },
      {
        path: 'catalog',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/catalog/pages/catalog-index-page/catalog-index.page').then((m) => m.CatalogIndexPageComponent),
        title: 'Каталог товаров',
      },
      {
        path: 'catalog/auto-parts',
        loadComponent: () =>
          import('./features/catalog/pages/catalog-page/catalog.page').then((m) => m.CatalogPageComponent),
        data: { catalogMode: 'auto-parts' },
        title: 'Автозапчасти — каталог',
      },
      {
        path: 'catalog/materials',
        loadComponent: () =>
          import('./features/catalog/pages/catalog-page/catalog.page').then((m) => m.CatalogPageComponent),
        data: { catalogMode: 'materials' },
        title: 'Материалы — каталог',
      },
      {
        path: 'catalog/all',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/catalog/pages/catalog-page/catalog.page').then((m) => m.CatalogPageComponent),
        data: { catalogMode: 'all' },
        title: 'Все товары',
      },
      {
        path: 'catalog/new',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/catalog/pages/product-create-page/product-create.page').then(
            (m) => m.ProductCreatePageComponent,
          ),
        title: 'Новый товар',
      },
      {
        path: 'catalog/:id/edit',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/catalog/pages/product-edit-page/product-edit.page').then((m) => m.ProductEditPageComponent),
        title: 'Редактирование товара',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.page').then((m) => m.LoginPageComponent),
        title: 'Вход для администратора',
      },
      {
        path: 'paint-matching',
        loadComponent: () =>
          import('./features/podbor-kraski/pages/podbor-kraski-page/podbor-kraski.page').then(m => m.PodborKraskiPageComponent),
        title: 'Подбор краски',
      },
      {
        path: 'body-repair',
        loadComponent: () =>
          import('./features/cuz-remont/pages/cuz-remont-page/cuz-remont.page').then(m => m.CuzRemontPageComponent),
        title: 'Автосервис',
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/legal/privacy.page').then((m) => m.PrivacyPageComponent),
        title: 'Политика конфиденциальности',
      },
      {
        path: 'cookies',
        loadComponent: () =>
          import('./features/legal/cookies.page').then((m) => m.CookiesPageComponent),
        title: 'Политика cookie',
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/legal/terms.page').then((m) => m.TermsPageComponent),
        title: 'Пользовательское соглашение',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
