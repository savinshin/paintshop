import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  // private readonly baseUrl = '/api/Categories';
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Categories`;

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  /**
   * Вспомогательный метод, если понадобится дерево категорий.
   */
  getTree() {
    return this.getAll().pipe(
      map((list) => this.buildTree(list)),
    );
  }

  private buildTree(list: Category[]) {
    const byId = new Map<number, Category & { children: Category[] }>();
    const roots: (Category & { children: Category[] })[] = [];

    for (const c of list) {
      byId.set(c.id, { ...c, children: [] });
    }

    for (const node of byId.values()) {
      if (node.parentId == null) {
        roots.push(node);
      } else {
        const parent = byId.get(node.parentId);
        if (parent) parent.children.push(node);
      }
    }

    const sortFn = (a: Category, b: Category) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id;

    roots.sort(sortFn);
    roots.forEach((r) => r.children.sort(sortFn));

    return roots;
  }
}
