import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CatalogService } from '@core/services/catalog.service';
import { Product } from '@core/models/product.model';
import { SeoService } from '@core/services/seo.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-catalog-page',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
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

  private queryInitialized = false;

  private readonly queryEffect = effect((onCleanup) => {
    const query = this.q().trim();

    if (!this.queryInitialized) {
      this.queryInitialized = true;
      return;
    }

    const t = setTimeout(() => this.load(query), 300);
    onCleanup(() => clearTimeout(t));
  });

  ngOnInit(): void {
    this.seo.setTitle('Каталог товаров');
    this.seo.setDescription(
      'Каталог: автоэмали, лаки, грунты, абразивы и расходники. Наличие и цены уточняйте по телефону.',
    );

    this.load();
  }

  private load(query?: string): void {
    this.loading.set(true);

    this.svc
      .getProducts(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.items.set(list),
        error: () => this.items.set([]),
      });
  }

  onQueryInput(value: string): void {
    this.q.set(value);
  }
}
