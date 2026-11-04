import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div class="container py-8 md:py-10"><h1>Политика cookie</h1><p class="opacity-80">Текст будет позже.</p></div>`
})
export class CookiesPageComponent {}
