import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Subject, catchError, map, of, startWith, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogService } from '@core/services/catalog.service';
import { Product } from '@core/models/product.model';
import { SeoService } from '@core/services/seo.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-catalog-page',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: 'catalog.page.html',
  styleUrl: 'catalog.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent implements OnInit {
  private readonly svc = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = this.auth.isAdmin;

  readonly q = signal('');
  readonly loading = signal(true);
  readonly items = signal<Product[]>([]);

  readonly error = signal(false);
  private readonly queries = new Subject<string>();

  constructor() {
    this.queries.pipe(
      startWith(''),
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap((query, index) => timer(index === 0 ? 0 : 300).pipe(
        switchMap(() => this.svc.getProducts(query)),
        map((items) => ({ items, error: false })),
        catchError(() => of({ items: [] as Product[], error: true })),
      )),
      takeUntilDestroyed(),
    ).subscribe((result) => {
      this.items.set(result.items);
      this.error.set(result.error);
      this.loading.set(false);
    });
  }

  ngOnInit(): void {
    this.seo.setTitle('Каталог товаров');
    this.seo.setDescription(
      'Каталог: автоэмали, лаки, грунты, абразивы и расходники. Наличие и цены уточняйте по телефону.',
    );
  }

  onQueryInput(value: string): void {
    this.q.set(value);
    this.queries.next(value.trim());
  }
}
