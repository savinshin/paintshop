import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-product-edit-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  private product: Product | null = null;
  private id = '';

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
        next: (list) => this.categories.set(list),
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
          this.form.patchValue({
            name: p.name ?? '',
            brand: p.brand ?? '',
            sku: p.sku ?? '',
            finish: p.finish ?? '',
            packageMl: p.packageMl ?? null,
            price: p.price ?? null,
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

  onSubmit(): void {
    if (!this.isAdmin() || !this.product || this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();
    if ((v.categoryIds?.length ?? 0) === 0) {
      this.error.set('Выберите хотя бы одну категорию.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload: Partial<Product> = {
      ...this.product,
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
          this.error.set('Не удалось сохранить изменения. Попробуйте ещё раз.');
        },
      });
  }

  getCategoryLabel(c: Category): string {
    if (c.parentId == null) return c.name;
    const parent = this.categories().find((p) => p.id === c.parentId);
    return parent ? `${parent.name} → ${c.name}` : c.name;
  }
}
