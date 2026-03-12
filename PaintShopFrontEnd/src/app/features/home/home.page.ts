import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { HOME_SEO } from './home.seo';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  constructor(private seo: SeoService) {}

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
