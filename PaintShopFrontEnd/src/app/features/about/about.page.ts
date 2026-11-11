import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
   imports: [RouterLink],
  templateUrl: './about.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    const title = 'О нас';
    const description = 'Магазин автозапчастей и автосервис кузовного ремонта в Беларуси.';
    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.clearOgUrlAndImage();
    this.seo.setOg({ type: 'website', title, description });
  }
}
