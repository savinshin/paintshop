import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { SeoService } from '@core/services/seo.service';

@Component({
  standalone: true,
  imports: [],
  templateUrl: 'cuz-remont.page.html',
  styleUrl: 'cuz-remont.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuzRemontPageComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    const title = 'Автосервис';
    const description = 'Кузовной ремонт после ДТП, покраска автомобиля и отдельных элементов, ремонт порогов.';
    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.clearOgUrlAndImage();
    this.seo.setOg({ type: 'website', title, description });
  }
}
