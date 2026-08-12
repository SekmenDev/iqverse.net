import { tools, Tool } from './tools';

// Utility functions
function normalizeUrl(path?: string): string {
  if (!path) return 'https://iqverse.net/';
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}/`;
  return `https://iqverse.net${normalizedPath}`;
}

export function getApplicationCategory(category: string): string {
  if (category === 'Security') return 'SecurityApplication';
  if (category === 'Design') return 'DesignApplication';
  if (category === 'Network' || category === 'Browser Tools') return 'UtilitiesApplication';
  if (category === 'SaaS') return 'BusinessApplication';
  if (category === 'AI & Agents') return 'DeveloperApplication';
  return 'DeveloperApplication';
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IQVerse',
    url: 'https://iqverse.net/',
    description:
      'IQVerse offers free, open-source browser-based developer tools for AI agent scanning, QR generation, link checking, favicon creation, JSON validation, CSS conversion, image optimization and more.',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://iqverse.net/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IQVerse',
      url: 'https://iqverse.net/',
      logo: 'https://iqverse.net/favicon-32x32.png',
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
    description: 'Free, open-source browser-based developer tools running locally with no telemetry.',
    inLanguage: 'en-US',
    sameAs: ['https://github.com/SekmenDev/iqverse.net', 'https://sekmen.dev'],
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      url: 'https://github.com/SekmenDev/iqverse.net/issues',
      contactType: 'technical support',
    },
  };
}

export function getSoftwareSourceCodeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'IQVerse',
    codeRepository: 'https://github.com/SekmenDev/iqverse.net',
    programmingLanguage: ['TypeScript', 'Next.js', 'React', 'HTML5', 'CSS3'],
    license: 'https://github.com/SekmenDev/iqverse.net/blob/main/LICENSE',
    author: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
    },
  };
}

export function getToolJsonLd(
  name: string,
  description?: string,
  urlPath?: string,
  category?: string
): [Record<string, any>, Record<string, any>] {
  const fullUrl = normalizeUrl(urlPath);
  const matchedTool = tools.find(
    t => t.name.toLowerCase() === name.toLowerCase() || (urlPath && t.url === urlPath)
  );

  const catName = category || matchedTool?.cat || matchedTool?.category || 'Developer';
  const appCategory = getApplicationCategory(catName);
  const toolDesc = description || matchedTool?.desc || matchedTool?.description || name;
  const keywords = matchedTool?.tags ? matchedTool.tags.split(' ').join(', ') : undefined;

  const webAppSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description: toolDesc,
    url: fullUrl,
    applicationCategory: appCategory,
    operatingSystem: 'All',
    platformRequirement: 'Requires a modern web browser with JavaScript and HTML5 support.',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: fullUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
      sameAs: ['https://github.com/SekmenDev/iqverse.net'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'IQVerse',
      url: 'https://iqverse.net/',
      logo: 'https://iqverse.net/favicon-32x32.png',
    },
    codeRepository: 'https://github.com/SekmenDev/iqverse.net',
    license: 'https://github.com/SekmenDev/iqverse.net/blob/main/LICENSE',
    dateModified: new Date().toISOString().split('T')[0],
  };

  if (keywords) {
    webAppSchema.keywords = keywords;
  }

  const breadcrumbsSchema = {
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
        name: catName,
        item: `https://iqverse.net/?cat=${encodeURIComponent(catName)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name,
        item: fullUrl,
      },
    ],
  };

  return [webAppSchema, breadcrumbsSchema];
}

export function getSaasJsonLd(
  brand: string,
  description?: string,
  appUrl?: string,
  urlPath?: string
): [Record<string, any>, Record<string, any>] {
  const fullUrl = normalizeUrl(urlPath);
  const matchedTool = tools.find(
    t => t.name.toLowerCase().includes(brand.toLowerCase()) || (urlPath && t.url === urlPath)
  );

  let appCategory = 'BusinessApplication';
  if (brand.toLowerCase().includes('goo') || brand.toLowerCase().includes('ges')) {
    appCategory = 'EducationalApplication';
  } else if (matchedTool) {
    appCategory = getApplicationCategory(matchedTool.cat);
  }

  const saasDesc = description || matchedTool?.desc || matchedTool?.description || brand;

  const saasAppSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: brand,
    description: saasDesc,
    url: appUrl || fullUrl,
    applicationCategory: appCategory,
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: appUrl || fullUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IQVerse',
      url: 'https://iqverse.net/',
      logo: 'https://iqverse.net/favicon-32x32.png',
    },
    dateModified: new Date().toISOString().split('T')[0],
  };

  const breadcrumbsSchema = {
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
        name: 'SaaS',
        item: 'https://iqverse.net/?cat=SaaS',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brand,
        item: fullUrl,
      },
    ],
  };

  return [saasAppSchema, breadcrumbsSchema];
}

export function getToolsCollectionJsonLd() {
  const openTools = tools.filter(t => t.url.startsWith('/'));

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'IQVerse Developer Tools Collection',
    description:
      'A comprehensive collection of free, open-source browser-based developer tools including AI agent scanning, QR code generation, link checking, favicon creation, JSON validation, CSS conversion, image optimization and more.',
    url: 'https://iqverse.net/',
    mainEntity: {
      '@type': 'ItemList',
      name: 'IQVerse Tools Catalog',
      numberOfItems: openTools.length,
      itemListElement: openTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        description: tool.desc,
        url: normalizeUrl(tool.url),
      })),
    },
    author: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
      sameAs: ['https://github.com/SekmenDev/iqverse.net'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'IQVerse',
      url: 'https://iqverse.net/',
      logo: 'https://iqverse.net/favicon-32x32.png',
    },
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    dateModified: new Date().toISOString().split('T')[0],
  };
}

export interface ToolInfo {
  name: string;
  description: string;
  icon: string;
  url: string;
  type: 'open' | 'saas' | 'coming';
  category: string;
}

export function generateToolThingSchema(tool: ToolInfo | Tool) {
  const fullUrl = normalizeUrl(tool.url);
  const isOpen = tool.type === 'open';
  const isSaas = tool.type === 'saas';
  const cat = 'cat' in tool ? tool.cat : tool.category;
  const description = 'desc' in tool ? tool.desc : tool.description;
  const applicationCategory = getApplicationCategory(cat || 'Developer');

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isOpen ? 'WebApplication' : 'SoftwareApplication',
    '@id': fullUrl,
    name: tool.name,
    description: description || tool.name,
    url: fullUrl,
    applicationCategory: applicationCategory,
    operatingSystem: isSaas ? 'Web' : 'All',
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: fullUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Sekmen.Dev',
      url: 'https://sekmen.dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IQVerse',
      url: 'https://iqverse.net/',
      logo: 'https://iqverse.net/favicon-32x32.png',
    },
  };

  if (!isSaas) {
    schema.browserRequirements = 'Requires JavaScript. Requires HTML5.';
    schema.platformRequirement = 'Requires a modern web browser with JavaScript and HTML5 support.';
  }

  if (isOpen) {
    schema.codeRepository = 'https://github.com/SekmenDev/iqverse.net';
    schema.license = 'https://github.com/SekmenDev/iqverse.net/blob/main/LICENSE';
  }

  return schema;
}

