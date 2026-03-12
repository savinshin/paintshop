export const HOME_SEO = {
  title: 'Автоэмали и автозапчасти — Барановичи | Главная',
  description:
    'Подбор автоэмалей по VIN/коду/образцу, кузовные материалы, автозапчасти под заказ. Быстро и точно. Барановичи.',
  og: {
    type: 'website',
    title: 'Автоэмали и автозапчасти — Барановичи | Главная',
    description:
      'Подбор автоэмалей по VIN/коду/образцу, кузовные материалы, автозапчасти под заказ. Быстро и точно. Барановичи.',
    url: 'https://example.by/',
    image: 'https://example.by/images/shopfront.webp',
  },
  jsonLdKey: 'local-business',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': ['AutoPartsStore', 'AutomotiveBusiness', 'LocalBusiness'],
    name: 'Магазин автокрасок и автозапчастей',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Барановичи',
      streetAddress: 'ул. Примерная, 1',
    },
    telephone: '+375290000000',
    url: 'https://example.by',
    openingHours: 'Mo-Fr 09:00-18:00 Sa 10:00-15:00',
    image: 'https://example.by/images/shopfront.webp',
    sameAs: ['https://t.me/your_username'],
  },
} as const;
