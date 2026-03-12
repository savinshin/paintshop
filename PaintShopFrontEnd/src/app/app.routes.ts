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
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/pages/catalog-page/catalog.page').then((m) => m.CatalogPageComponent),
        title: 'Каталог товаров',
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
        path: 'avtoparts',
        redirectTo: 'catalog',
        pathMatch: 'full',
      },
      {
        path: 'podbor-kraski',
        loadComponent: () =>
          import('./features/podbor-kraski/pages/podbor-kraski-page/podbor-kraski.page').then(m => m.PodborKraskiPageComponent),
        title: 'Подбор краски',
      },
      {
        path: 'cuz-remont',
        loadComponent: () =>
          import('./features/cuz-remont/pages/cuz-remont-page/cuz-remont.page').then(m => m.CuzRemontPageComponent),
        title: 'Кузовной ремонт',
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
