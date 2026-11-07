import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CatalogService } from '@core/services/catalog.service';
import { CategoryService } from '@core/services/category.service';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';

import { CreateProductRequest } from '@core/models/product.model';
import { Category } from '@core/models/category.model';
import { fieldError, optionalInteger, priceValidator, requiredTrimmed, validationErrors } from '../../forms/product-form.validation';

@Component({
  standalone: true,
  selector: 'app-product-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'product-create.page.html',
  styleUrl: 'product-create.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePageComponent implements OnInit {
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
  readonly serverErrors = signal<Record<string, string[]>>({});
  readonly selectedRootId = signal<number | null>(null);

  private readonly sortCategories = (a: Category, b: Category) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id;

  readonly rootCategories = computed(() =>
    this.categories()
      .filter((c) => c.parentId == null)
      .slice()
      .sort(this.sortCategories),
  );

  readonly childCategories = computed(() => {
    const rootId = this.selectedRootId();
    const descendants: { id: number; label: string }[] = [];
    if (rootId == null) return descendants;

    const categories = this.categories();
    const addChildren = (parentId: number, parentPath: string): void => {
      const children = categories.filter((c) => c.parentId === parentId).sort(this.sortCategories);
      for (const child of children) {
        const label = parentPath ? `${parentPath} → ${child.name}` : child.name;
        descendants.push({ id: child.id, label });
        addChildren(child.id, label);
      }
    };

    addChildren(rootId, '');
    return descendants;
  });

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
    this.seo.setTitle('Новый товар');
    this.seo.setDescription('Создание нового товара в каталоге.');
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesSvc
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          this.categories.set(list);
          this.categoriesLoaded.set(true);
        },
        error: () => {
          this.categories.set([]);
          this.selectedRootId.set(null);
          this.form.patchValue({ categoryIds: [] });
          this.error.set('Не удалось загрузить категории.');
        },
      });
  }

  onRootCategoryChange(rawValue: string): void {
    const id = rawValue ? Number(rawValue) : null;
    this.selectedRootId.set(id != null && Number.isFinite(id) ? id : null);
    this.form.patchValue({ categoryIds: [] });
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
    if (!this.isAdmin() || !this.categoriesLoaded() || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const selectedRoot = this.selectedRootId();
    const selectedChildren = v.categoryIds ?? [];
    const categoryIds = [...selectedChildren];

    if (selectedRoot != null && !categoryIds.includes(selectedRoot)) {
      categoryIds.unshift(selectedRoot);
    }

    if (categoryIds.length === 0) {
      this.serverErrors.update((errors) => ({ ...errors, categoryIds: ['Выберите категорию.'] }));
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.serverErrors.set({});

    const payload: CreateProductRequest = {
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
      categoryIds,
    };

    this.catalogSvc
      .createProduct(payload)
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
          this.error.set('Не удалось создать товар. Попробуйте ещё раз.');
        },
      });
  }
}
