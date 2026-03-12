import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '@core/services/seo.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'podbor-kraski.page.html',
  styleUrl: 'podbor-kraski.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodborKraskiPageComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setTitle('Как работаем — Автокраски & Запчасти');
    this.seo.setDescription('Понятные шаги: запчасти и автоэмали. Куда отправлять VIN/код/фото для подбора.');
  }
}
