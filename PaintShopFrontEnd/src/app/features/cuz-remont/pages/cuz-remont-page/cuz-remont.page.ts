import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '@core/services/seo.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'cuz-remont.page.html',
  styleUrl: 'cuz-remont.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuzRemontPageComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setTitle('Контакты — Автокраски & Запчасти');
    this.seo.setDescription('Адрес, график, телефон, email и мессенджеры магазина в Барановичах.');
  }
}
