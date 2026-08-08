export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IQVerse',
    url: 'https://iqverse.net/',
    description:
      'IQVerse offers free, open-source browser-based developer tools for AI agent scanning, QR generation, link checking, favicon creation, JSON validation, CSS conversion, image optimization and more.',
    publisher: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IQVerse',
    url: 'https://iqverse.net/',
    logo: 'https://iqverse.net/favicon-32x32.png',
    sameAs: ['https://github.com/SekmenDev/iqverse.net'],
  };
}

export function getToolJsonLd(name: string, description?: string, urlPath?: string) {
  const fullUrl = urlPath
    ? urlPath.startsWith('http')
      ? urlPath
      : `https://iqverse.net${urlPath.startsWith('/') ? urlPath : `/${urlPath}/`}`
    : 'https://iqverse.net/';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name,
      description: description || name,
      url: fullUrl,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Organization',
        name: 'Sekmen.Dev',
        url: 'https://sekmen.dev',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://iqverse.net/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name,
          item: fullUrl,
        },
      ],
    },
  ];
}

export function getSaasJsonLd(brand: string, description?: string, appUrl?: string, urlPath?: string) {
  const fullUrl = urlPath
    ? urlPath.startsWith('http')
      ? urlPath
      : `https://iqverse.net${urlPath.startsWith('/') ? urlPath : `/${urlPath}/`}`
    : 'https://iqverse.net/';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: brand,
      description: description || brand,
      url: appUrl || fullUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      author: {
        '@type': 'Organization',
        name: 'Sekmen.Dev',
        url: 'https://sekmen.dev',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://iqverse.net/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: brand,
          item: fullUrl,
        },
      ],
    },
  ];
}
