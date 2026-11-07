import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CatalogService } from '@core/services/catalog.service';
import { CategoryService } from '@core/services/category.service';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';

import { Product, UpdateProductRequest } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { fieldError, optionalInteger, priceValidator, requiredTrimmed, validationErrors } from '../../forms/product-form.validation';

@Component({
  standalone: true,
  selector: 'app-product-edit-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'product-edit.page.html',
  styleUrl: 'product-edit.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly catalogSvc = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly categoriesSvc = inject(CategoryService);

  readonly isAdmin = this.auth.isAdmin;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly categories = signal<Category[]>([]);
  readonly categoriesLoaded = signal(false);
  readonly productLoaded = signal(false);
  readonly serverErrors = signal<Record<string, string[]>>({});

  private product: Product | null = null;
  private id = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', requiredTrimmed(256)],
    brand: ['', requiredTrimmed(128)],
    sku: ['', requiredTrimmed(64)],
    finish: ['', Validators.maxLength(64)],
    packageMl: [null as number | null, optionalInteger(1)],
    price: ['', priceValidator],
    currency: ['', Validators.maxLength(8)],
    stockQty: [null as number | null, optionalInteger(0)],
    hex: ['', Validators.maxLength(16)],
    imageUrl: ['', Validators.maxLength(1024)],
    categoryIds: [[] as number[]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/catalog');
      return;
    }

    this.id = id;

    this.seo.setTitle('Редактирование товара');
    this.seo.setDescription('Изменение данных товара в каталоге.');

    this.loadCategories();
    this.loadProduct();
  }

  private loadCategories(): void {
    this.categoriesSvc
      .getAll()
      .subscribe({
        next: (list) => {
          this.categories.set(list);
          this.categoriesLoaded.set(true);
        },
        error: () => {
          this.categories.set([]);
          this.error.update((current) => current ?? 'Не удалось загрузить категории.');
        },
      });
  }

  private loadProduct(): void {
    this.loading.set(true);
    // this.error.set(null);  // УБРАТЬ, чтобы не затирать ошибку категорий

    this.catalogSvc
      .getProduct(this.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (p) => {
          this.product = p;
          this.productLoaded.set(true);
          this.form.patchValue({
            name: p.name ?? '',
            brand: p.brand ?? '',
            sku: p.sku ?? '',
            finish: p.finish ?? '',
            packageMl: p.packageMl ?? null,
            price: p.price != null ? String(p.price) : '',
            currency: p.currency ?? '',
            stockQty: p.stockQty ?? null,
            hex: p.hex ?? '',
            imageUrl: p.imageUrl ?? '',
            categoryIds: p.categoryIds ?? [],
          });

          this.seo.setTitle(`Редактирование товара: ${p.name ?? p.sku ?? p.id}`);
        },
        error: (err: HttpErrorResponse) => {
          this.product = null;
          this.form.patchValue({ categoryIds: [] });

          if (err.status === 401 || err.status === 403) {
            this.error.set('Недостаточно прав. Войдите как администратор на странице /login.');
            return;
          }
          if (err.status === 404) {
            this.error.set('Товар не найден.');
            return;
          }
          this.error.set('Произошла ошибка при загрузке товара.');
        },
      });
  }

  fieldError(name: string): string | null {
    return fieldError(this.form, name, this.serverErrors());
  }

  clearFieldError(name: string): void {
    this.serverErrors.update((errors) => {
      const updated = { ...errors };
      delete updated[name];
      return updated;
    });
  }

  onSubmit(): void {
    if (!this.isAdmin() || !this.product || !this.categoriesLoaded() || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    if ((v.categoryIds?.length ?? 0) === 0) {
      this.serverErrors.update((errors) => ({ ...errors, categoryIds: ['Выберите хотя бы одну категорию.'] }));
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.serverErrors.set({});

    const payload: UpdateProductRequest = {
      name: v.name.trim(),
      brand: v.brand.trim(),
      sku: v.sku.trim(),
      finish: v.finish.trim() || null,
      packageMl: v.packageMl,
      price: v.price.trim() ? Number(v.price.trim().replace(',', '.')) : null,
      currency: v.currency.trim() || null,
      stockQty: v.stockQty,
      hex: v.hex.trim() || null,
      imageUrl: v.imageUrl.trim() || null,
      categoryIds: v.categoryIds ?? [],
    };

    this.catalogSvc
      .updateProduct(this.id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/catalog']),
        error: (err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 403) {
            this.error.set('Недостаточно прав. Войдите как администратор на странице /login.');
            return;
          }
          if (err.status === 400) {
            const result = validationErrors(err, this.form);
            this.serverErrors.set(result.fields);
            this.error.set(result.other.join(' ') || (Object.keys(result.fields).length ? 'Проверьте указанные поля.' : 'Проверьте данные товара.'));
            return;
          }
          this.error.set('Не удалось сохранить изменения. Попробуйте ещё раз.');
        },
      });
  }

  getCategoryLabel(c: Category): string {
    const names = [c.name];
    const visited = new Set([c.id]);
    let parentId = c.parentId;

    while (parentId != null && !visited.has(parentId)) {
      const parent = this.categories().find((category) => category.id === parentId);
      if (!parent) break;
      visited.add(parent.id);
      names.unshift(parent.name);
      parentId = parent.parentId;
    }

    return names.join(' → ');
  }
}
