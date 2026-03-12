import { DOCUMENT } from '@angular/common';
import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTitle(text: string) {
    this.title.setTitle(text);
  }

  setDescription(desc: string) {
    this.meta.updateTag({ name: 'description', content: desc });
  }

  setOg(params: Partial<Record<'type'|'title'|'description'|'url'|'image', string>>) {
    if (params.type) this.meta.updateTag({ property: 'og:type', content: params.type });
    if (params.title) this.meta.updateTag({ property: 'og:title', content: params.title });
    if (params.description) this.meta.updateTag({ property: 'og:description', content: params.description });
    if (params.url) this.meta.updateTag({ property: 'og:url', content: params.url });
    if (params.image) this.meta.updateTag({ property: 'og:image', content: params.image });
  }

  setJsonLd(key: string, data: unknown) {
    const id = `ld-json-${key}`;
    let scriptEl = this.document.getElementById(id) as HTMLScriptElement | null;
    const json = JSON.stringify(data, null, 2);

    if (!scriptEl) {
      scriptEl = this.renderer.createElement('script');
      this.renderer.setAttribute(scriptEl, 'type', 'application/ld+json');
      this.renderer.setAttribute(scriptEl, 'id', id);
      this.renderer.appendChild(this.document.head, scriptEl);
    }

  // здесь scriptEl уже точно не null — используем non-null assertion для TS
  scriptEl!.textContent = json;
  }

  removeJsonLd(key: string) {
    const id = `ld-json-${key}`;
    const el = this.document.getElementById(id);
    el?.parentNode?.removeChild(el);
  }
}
