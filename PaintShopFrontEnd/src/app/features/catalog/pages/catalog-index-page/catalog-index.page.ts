import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';

@Component({
  standalone: true,
  selector: 'app-catalog-index-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-8 md:py-10" aria-labelledby="catalog-index-title">
      <div class="container">
        <h1 id="catalog-index-title" class="text-2xl font-semibold">Каталог товаров</h1>
        <div class="mt-4 flex flex-wrap gap-2">
          <a class="btn btn-outline" routerLink="/catalog/auto-parts">Автозапчасти</a>
          <a class="btn btn-outline" routerLink="/catalog/materials">Материалы</a>
          @if (isAdmin()) {
            <a class="btn btn-ghost" routerLink="/catalog/all">Все товары</a>
          }
        </div>
      </div>
    </section>
  `,
})
export class CatalogIndexPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly isAdmin = inject(AuthService).isAdmin;

  ngOnInit(): void {
    this.seo.setTitle('Каталог товаров');
    this.seo.setDescription('Каталог автозапчастей и материалов для кузовного ремонта в Барановичах.');
  }
}
