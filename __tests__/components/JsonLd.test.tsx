import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import JsonLd from '@/components/JsonLd';
import {
  getWebSiteJsonLd,
  getOrganizationJsonLd,
  getToolJsonLd,
  getSaasJsonLd,
  getSoftwareSourceCodeJsonLd,
  getToolsCollectionJsonLd,
} from '@/lib/jsonld';

describe('JsonLd Component & Helpers', () => {
  it('renders application/ld+json script tag with correct JSON content', () => {
    const sampleData = { '@context': 'https://schema.org', '@type': 'Thing', name: 'Test' };
    const { container } = render(<JsonLd data={sampleData} />);

    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).not.toBeNull();
    expect(scriptTag?.textContent).toContain('"@type":"Thing"');
    expect(scriptTag?.textContent).toContain('"name":"Test"');
  });

  it('escapes opening angle brackets to prevent script injection', () => {
    const maliciousData = { note: '<script>alert(1)</script>' };
    const { container } = render(<JsonLd data={maliciousData} />);

    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag?.innerHTML).not.toContain('<script>');
    expect(scriptTag?.innerHTML).toContain('\\u003cscript>');
  });

  it('generates valid WebSite JSON-LD data with query-input', () => {
    const data = getWebSiteJsonLd();
    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('IQVerse');
    expect(data.url).toBe('https://iqverse.net/');
    expect(data.potentialAction['query-input']).toBe('required name=search_term_string');
  });

  it('generates valid Organization JSON-LD data', () => {
    const data = getOrganizationJsonLd();
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('IQVerse');
    expect(data.url).toBe('https://iqverse.net/');
    expect(data.contactPoint.contactType).toBe('technical support');
  });

  it('generates SoftwareSourceCode JSON-LD data', () => {
    const data = getSoftwareSourceCodeJsonLd();
    expect(data['@type']).toBe('SoftwareSourceCode');
    expect(data.name).toBe('IQVerse');
    expect(data.codeRepository).toBe('https://github.com/SekmenDev/iqverse.net');
  });

  it('generates WebApplication and 3-level BreadcrumbList schemas for tools', () => {
    const schemas = getToolJsonLd('QR Forge', 'Generate QR codes', '/qrforge/');
    expect(Array.isArray(schemas)).toBe(true);
    expect(schemas).toHaveLength(2);

    const webApp = schemas[0];
    expect(webApp['@type']).toBe('WebApplication');
    expect(webApp.name).toBe('QR Forge');
    expect(webApp.url).toBe('https://iqverse.net/qrforge/');
    expect(webApp.applicationCategory).toBe('UtilitiesApplication');
    expect(webApp.softwareVersion).toBe('1.0.0');

    const breadcrumbs = schemas[1];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].name).toBe('Home');
    expect(breadcrumbs.itemListElement[1].name).toBe('Browser Tools');
    expect(breadcrumbs.itemListElement[2].name).toBe('QR Forge');
  });

  it('generates SoftwareApplication and BreadcrumbList schemas for SaaS', () => {
    const schemas = getSaasJsonLd('GOO', 'School Management', 'https://sekmen.dev/products/goo', '/goo/');
    expect(schemas).toHaveLength(2);

    const saasApp = schemas[0];
    expect(saasApp['@type']).toBe('SoftwareApplication');
    expect(saasApp.name).toBe('GOO');
    expect(saasApp.applicationCategory).toBe('EducationalApplication');

    const breadcrumbs = schemas[1];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  it('generates CollectionPage schema containing ItemList of all tools', () => {
    const collection = getToolsCollectionJsonLd();
    expect(collection['@type']).toBe('CollectionPage');
    expect(collection.mainEntity['@type']).toBe('ItemList');
    expect(collection.mainEntity.numberOfItems).toBeGreaterThan(40);
    expect(collection.mainEntity.itemListElement.length).toBe(collection.mainEntity.numberOfItems);
  });
});

