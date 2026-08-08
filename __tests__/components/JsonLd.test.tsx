import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import JsonLd from '@/components/JsonLd';
import { getWebSiteJsonLd, getOrganizationJsonLd, getToolJsonLd, getSaasJsonLd } from '@/lib/jsonld';

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

  it('generates valid WebSite JSON-LD data', () => {
    const data = getWebSiteJsonLd();
    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('IQVerse');
    expect(data.url).toBe('https://iqverse.net/');
  });

  it('generates valid Organization JSON-LD data', () => {
    const data = getOrganizationJsonLd();
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('IQVerse');
    expect(data.url).toBe('https://iqverse.net/');
  });

  it('generates WebApplication and BreadcrumbList schemas for tools', () => {
    const schemas = getToolJsonLd('QR Forge', 'Generate QR codes', '/qrforge/');
    expect(Array.isArray(schemas)).toBe(true);
    expect(schemas).toHaveLength(2);

    const webApp = schemas[0];
    expect(webApp['@type']).toBe('WebApplication');
    expect(webApp.name).toBe('QR Forge');
    expect(webApp.url).toBe('https://iqverse.net/qrforge/');

    const breadcrumbs = schemas[1];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(2);
  });

  it('generates SoftwareApplication and BreadcrumbList schemas for SaaS', () => {
    const schemas = getSaasJsonLd('GOO', 'School Management', 'https://sekmen.dev/products/goo', '/goo/');
    expect(schemas).toHaveLength(2);

    const saasApp = schemas[0];
    expect(saasApp['@type']).toBe('SoftwareApplication');
    expect(saasApp.name).toBe('GOO');

    const breadcrumbs = schemas[1];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
  });
});
