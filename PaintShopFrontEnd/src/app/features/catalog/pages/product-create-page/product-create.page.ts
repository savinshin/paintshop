import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CatalogService } from '@core/services/catalog.service';
import { CategoryService } from '@core/services/category.service';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';

import { Product } from '@core/models/product.model';
import { Category } from '@core/models/category.model';

@Component({
  standalone: true,
  selector: 'app-product-create-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
    if (rootId == null) return [] as Category[];

    return this.categories()
      .filter((c) => c.parentId === rootId)
      .slice()
      .sort(this.sortCategories);
  });

  readonly form = this.fb.nonNullable.group({
    name: [''],
    brand: [''],
    sku: [''],
    finish: [''],
    packageMl: [null as number | null],
    price: [null as number | null],
    currency: [''],
    stockQty: [null as number | null],
    hex: [''],
    imageUrl: [''],
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
        next: (list) => this.categories.set(list),
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

  onSubmit(): void {
    if (!this.isAdmin() || this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();

    const selectedRoot = this.selectedRootId();
    const selectedChildren = v.categoryIds ?? [];
    const categoryIds = [...selectedChildren];

    if (selectedRoot != null && !categoryIds.includes(selectedRoot)) {
      categoryIds.unshift(selectedRoot);
    }

    if (categoryIds.length === 0) {
      this.error.set('Выберите категорию.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload: Partial<Product> = {
      name: v.name.trim() || null,
      brand: v.brand.trim() || null,
      sku: v.sku.trim() || null,
      finish: v.finish.trim() || null,
      packageMl: v.packageMl,
      price: v.price,
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
          this.error.set('Не удалось создать товар. Попробуйте ещё раз.');
        },
      });
  }
}
