import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { HOME_SEO } from './home.seo';

interface HomeSlide {
  text: string;
  image?: { src: string; alt: string };
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly slides: readonly HomeSlide[] = [
    { text: 'Профессиональная колеровочная система' },
    { text: 'Подбор автоэмалей' },
    { text: 'Профессиональные материалы для кузовного ремонта' },
    { text: 'Услуги автосервиса — профессиональная работа мастеров кузовного ремонта' },
    { text: 'Широкий выбор автозапчастей' },
  ];
  readonly activeSlide = signal(0);

  constructor(private seo: SeoService) {}

  previousSlide(): void {
    this.activeSlide.update((index) => (index + this.slides.length - 1) % this.slides.length);
  }

  nextSlide(): void {
    this.activeSlide.update((index) => (index + 1) % this.slides.length);
  }

  ngOnInit(): void {
    this.seo.setTitle(HOME_SEO.title);
    this.seo.setDescription(HOME_SEO.description);
    this.seo.setOg(HOME_SEO.og);
    this.seo.setJsonLd(HOME_SEO.jsonLdKey, HOME_SEO.jsonLd);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd(HOME_SEO.jsonLdKey);
  }
}
