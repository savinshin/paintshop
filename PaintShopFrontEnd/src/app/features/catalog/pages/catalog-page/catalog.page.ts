import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Observable, Subject, catchError, distinctUntilChanged, map, of, shareReplay, switchMap, tap, timer } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CatalogService } from '@core/services/catalog.service';
import { CategoryService } from '@core/services/category.service';
import { SeoService } from '@core/services/seo.service';
import { CategoryTreeNode } from '@core/models/category.model';
import { Product } from '@core/models/product.model';

type CatalogMode = 'auto-parts' | 'materials' | 'all';
type CatalogSection = Exclude<CatalogMode, 'all'>;
type FilterState = { query: string; category: string | null };
type CatalogEvent = { kind: 'route'; state: FilterState } | { kind: 'search'; value: string; revision: number } | { kind: 'cancel' };
type CategoryOption = { id: number; slug: string; label: string };
type CategoryContext = { kind: 'ready'; rootId: number; options: CategoryOption[]; idsBySlug: Map<string, number> } | { kind: 'error' } | { kind: 'missing' } | { kind: 'unauthorized' };
type CatalogResult = { kind: 'success'; items: Product[] } | { kind: 'category-error' | 'missing-root' | 'invalid-category' | 'product-error' | 'unauthorized' };
type SearchNavigationInfo = { source: 'catalog-search'; revision: number };

const POPULAR_BRANDS: Record<CatalogSection, readonly string[]> = {
  'auto-parts': [],
  materials: [],
};

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
  private readonly categoriesSvc = inject(CategoryService);
  private readonly seo = inject(SeoService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly events = new Subject<CatalogEvent>();
  private searchRevision = 0;

  readonly mode = this.route.snapshot.data['catalogMode'] as CatalogMode;
  readonly sectionSlug = this.mode === 'auto-parts' ? 'avtozapchasti' : this.mode === 'materials' ? 'materialy' : null;
  readonly isAdmin = this.auth.isAdmin;
  readonly title = this.mode === 'auto-parts' ? 'Автозапчасти' : this.mode === 'materials' ? 'Материалы' : 'Все товары';
  readonly brands = this.mode === 'all' ? [] : POPULAR_BRANDS[this.mode];
  readonly q = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly categoryOptions = signal<CategoryOption[]>([]);
  readonly loading = signal(true);
  readonly items = signal<Product[]>([]);
  readonly error = signal<CatalogResult['kind'] | null>(null);

  private readonly categoryContext$: Observable<CategoryContext> = this.mode === 'all'
    ? of<CategoryContext>({ kind: 'missing' })
    : this.categoriesSvc.getTree().pipe(
        map((roots): CategoryContext => {
          const rootSlug = this.mode === 'auto-parts' ? 'avtozapchasti' : 'materialy';
          const root = roots.find((category) => category.slug === rootSlug);
          if (!root) return { kind: 'missing' };

          const options: CategoryOption[] = [];
          const idsBySlug = new Map<string, number>([[rootSlug, root.id]]);
          const pending: { node: CategoryTreeNode; parentPath: string }[] = [];
          for (let i = root.children.length - 1; i >= 0; i--) {
            pending.push({ node: root.children[i], parentPath: '' });
          }
          while (pending.length > 0) {
            const { node, parentPath } = pending.pop()!;
            const label = parentPath ? `${parentPath} → ${node.name}` : node.name;
            const slug = node.slug!;
            options.push({ id: node.id, slug, label });
            idsBySlug.set(slug, node.id);
            for (let i = node.children.length - 1; i >= 0; i--) {
              pending.push({ node: node.children[i], parentPath: label });
            }
          }
          return { kind: 'ready', rootId: root.id, options, idsBySlug };
        }),
        catchError((error: HttpErrorResponse) => of<CategoryContext>({
          kind: error.status === 401 || error.status === 403 ? 'unauthorized' : 'error',
        })),
        takeUntilDestroyed(this.destroyRef),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

  ngOnInit(): void {
    const title = this.mode === 'auto-parts' ? 'Автозапчасти — каталог' : this.mode === 'materials' ? 'Материалы — каталог' : 'Все товары';
    const description = this.mode === 'auto-parts'
      ? 'Каталог автозапчастей для легковых и грузовых российских автомобилей в Барановичах.'
      : this.mode === 'materials'
        ? 'Каталог материалов для кузовного ремонта и покраски автомобилей в Барановичах.'
        : 'Все товары каталога.';
    this.seo.setTitle(title);
    this.seo.setDescription(description);

    this.events.pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap((event): Observable<CatalogResult> => {
        if (event.kind === 'cancel') return EMPTY;
        if (event.kind === 'route') return this.loadProducts(event.state);
        return timer(300).pipe(switchMap(() => {
          const query = event.value.trim();
          const current = this.route.snapshot.queryParamMap;
          if (query !== (current.get('q') ?? '')) {
            const info: SearchNavigationInfo = { source: 'catalog-search', revision: event.revision };
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { q: query || null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
              info,
            });
            return EMPTY;
          }
          return this.loadProducts({ query, category: current.get('category') });
        }));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.loading.set(false);
      if (result.kind === 'success') {
        this.items.set(result.items);
        this.error.set(null);
      } else {
        this.items.set([]);
        this.error.set(result.kind);
      }
    });

    this.route.queryParamMap.pipe(
      map((params): FilterState => ({ query: params.get('q') ?? '', category: params.get('category') })),
      distinctUntilChanged((a, b) => a.query === b.query && a.category === b.category),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((state) => {
      const info = this.router.currentNavigation()?.extras.info as SearchNavigationInfo | undefined;
      if (info?.source === 'catalog-search' && info.revision !== this.searchRevision) return;
      this.searchRevision++;
      this.q.set(state.query);
      this.selectedCategory.set(state.category);
      this.events.next({ kind: 'route', state });
    });
  }

  onQueryInput(value: string): void {
    this.q.set(value);
    const revision = ++this.searchRevision;
    this.events.next({ kind: 'search', value, revision });
  }

  onCategoryChange(value: string): void {
    const category = value || null;
    const query = this.q().trim();
    const current = this.route.snapshot.queryParamMap;
    if (category === current.get('category') && query === (current.get('q') ?? '')) return;
    this.searchRevision++;
    this.events.next({ kind: 'cancel' });
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category, q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  private loadProducts(state: FilterState): Observable<CatalogResult> {
    if (this.mode === 'all') return this.requestProducts(state.query);
    return this.categoryContext$.pipe(switchMap((context): Observable<CatalogResult> => {
      if (context.kind === 'error') return of({ kind: 'category-error' });
      if (context.kind === 'missing') return of({ kind: 'missing-root' });
      if (context.kind === 'unauthorized') return of({ kind: 'unauthorized' });
      this.categoryOptions.set(context.options);
      const categoryId = state.category === null ? context.rootId : context.idsBySlug.get(state.category);
      if (categoryId == null) return of({ kind: 'invalid-category' });
      return this.requestProducts(state.query, categoryId);
    }));
  }

  private requestProducts(query: string, categoryId?: number): Observable<CatalogResult> {
    return this.svc.getProducts(query, categoryId).pipe(
      map((items): CatalogResult => ({ kind: 'success', items })),
      catchError((error: HttpErrorResponse) => of({
        kind: error.status === 401 || error.status === 403 ? 'unauthorized' : 'product-error',
      } as CatalogResult)),
    );
  }
}
