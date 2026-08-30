import { describe, it, expect } from 'vitest';
import {
  extractHtmlSignals,
  evaluateBaselineAudit,
  generateMarkdownReport,
  type EndpointResponses,
} from '@/lib/web-baseline';

describe('lib/web-baseline.ts - HTML Signals Extraction', () => {
  it('extracts head metadata: title, description, viewport, charset, canonical, htmlLang, favicon', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>IQVerse — Developer Tools</title>
        <meta name="description" content="Free open-source tools for developers and creators." />
        <link rel="canonical" href="https://iqverse.net/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <h1>Main Heading</h1>
      </body>
      </html>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.htmlLang).toBe('en-US');
    expect(signals.charset).toBe('utf-8');
    expect(signals.viewport).toBe('width=device-width, initial-scale=1.0');
    expect(signals.title).toBe('IQVerse — Developer Tools');
    expect(signals.metaDescription).toBe('Free open-source tools for developers and creators.');
    expect(signals.canonical).toBe('https://iqverse.net/');
    expect(signals.favicons).toContain('/favicon.svg');
    expect(signals.favicons).toContain('/icon-192.png');
    expect(signals.themeColor).toBe('#4f46e5');
    expect(signals.manifest).toBe('/manifest.json');
  });

  it('extracts semantic landmarks: h1, header, nav, main, footer', () => {
    const html = `
      <header>
        <nav><a href="/home">Home</a></nav>
      </header>
      <main>
        <h1>Welcome to IQVerse</h1>
        <p>Content goes here</p>
      </main>
      <footer>
        <p>© 2026 IQVerse</p>
      </footer>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.hasHeader).toBe(true);
    expect(signals.hasNav).toBe(true);
    expect(signals.hasMain).toBe(true);
    expect(signals.hasFooter).toBe(true);
    expect(signals.h1s).toEqual(['Welcome to IQVerse']);
  });

  it('detects multiple H1s or missing H1', () => {
    const multipleH1Html = `<h1>First H1</h1><h1>Second H1</h1>`;
    const signalsMulti = extractHtmlSignals(multipleH1Html);
    expect(signalsMulti.h1s.length).toBe(2);

    const noH1Html = `<h2>Subheading</h2>`;
    const signalsNone = extractHtmlSignals(noH1Html);
    expect(signalsNone.h1s.length).toBe(0);
  });

  it('audits images for alt attributes', () => {
    const html = `
      <img src="/logo.svg" alt="Company Logo" />
      <img src="/banner.jpg" alt="" />
      <img src="/chart.png" />
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.imgCount).toBe(3);
    expect(signals.imgAltCount).toBe(2);
    expect(signals.imgsWithoutAlt).toBe(1);
  });

  it('audits anchor links for valid and empty hrefs', () => {
    const html = `
      <a href="https://example.com">Valid</a>
      <a href="/docs">Docs</a>
      <a href="#">Placeholder</a>
      <a href="">Empty</a>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.linksCount).toBe(4);
    expect(signals.emptyLinksCount).toBe(2);
  });

  it('extracts and parses Schema.org JSON-LD structured data', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "IQVerse",
        "applicationCategory": "DeveloperApplication"
      }
      </script>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.hasSchemaJsonLd).toBe(true);
    expect(signals.schemaIsValidJson).toBe(true);
    expect(signals.schemaTypes).toContain('SoftwareApplication');
  });

  it('detects invalid Schema.org JSON-LD syntax', () => {
    const html = `
      <script type="application/ld+json">
      { broken json here
      </script>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.hasSchemaJsonLd).toBe(true);
    expect(signals.schemaIsValidJson).toBe(false);
  });

  it('extracts Open Graph and Twitter card tags', () => {
    const html = `
      <meta property="og:title" content="Social Title" />
      <meta property="og:description" content="Social Description" />
      <meta property="og:image" content="https://iqverse.net/og.png" />
      <meta property="og:url" content="https://iqverse.net/" />
      <meta name="twitter:card" content="summary_large_image" />
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.ogTitle).toBe('Social Title');
    expect(signals.ogDescription).toBe('Social Description');
    expect(signals.ogImage).toBe('https://iqverse.net/og.png');
    expect(signals.ogUrl).toBe('https://iqverse.net/');
    expect(signals.twitterCard).toBe('summary_large_image');
  });

  it('identifies robots noindex directive', () => {
    const html = `<meta name="robots" content="noindex, nofollow" />`;
    const signals = extractHtmlSignals(html);
    expect(signals.isNoindex).toBe(true);
  });
});

describe('lib/web-baseline.ts - Baseline Audit Evaluation', () => {
  it('grades a fully compliant modern website with high score and grade A+', () => {
    const endpoints: EndpointResponses = {
      home: {
        ok: true,
        status: 200,
        time: 85,
        headers: {
          'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'DENY',
          'referrer-policy': 'strict-origin-when-cross-origin',
        },
        body: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IQVerse — Modern Open Source Developer Platform</title>
            <meta name="description" content="Fast, browser-native developer tools with zero data tracking.">
            <link rel="canonical" href="https://iqverse.net/">
            <link rel="icon" href="/favicon.svg">
            <meta property="og:title" content="IQVerse">
            <meta property="og:description" content="Developer platform">
            <meta property="og:image" content="https://iqverse.net/og.jpg">
            <meta property="og:url" content="https://iqverse.net/">
            <meta name="twitter:card" content="summary_large_image">
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IQVerse"
            }
            </script>
          </head>
          <body>
            <header><nav><a href="/">Home</a></nav></header>
            <main>
              <h1>Fast Developer Tools</h1>
              <img src="/logo.svg" alt="IQVerse Logo">
            </main>
            <footer><p>© 2026</p></footer>
          </body>
          </html>
        `,
      },
      robots: {
        ok: true,
        status: 200,
        body: 'User-agent: *\nAllow: /\nSitemap: https://iqverse.net/sitemap.xml',
      },
      sitemap: {
        ok: true,
        status: 200,
        body: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://iqverse.net/</loc></url></urlset>',
      },
      llms: {
        ok: true,
        status: 200,
        body: '# IQVerse Docs\n> LLM summary for AI crawlers.',
      },
    };

    const report = evaluateBaselineAudit('https://iqverse.net', endpoints);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.grade).toBe('A+');
    expect(report.passedCount).toBeGreaterThanOrEqual(18);
    expect(report.failCount).toBe(0);
  });

  it('evaluates deficient website with low score and appropriate warnings/failures', () => {
    const endpoints: EndpointResponses = {
      home: {
        ok: false,
        status: 404,
        time: 300,
        headers: {},
        body: '<html><body>404 Not Found</body></html>',
      },
    };

    const report = evaluateBaselineAudit('http://insecure-broken-site.com', endpoints);
    expect(report.score).toBeLessThan(50);
    expect(report.grade).toBe('F');
    expect(report.failCount).toBeGreaterThan(3);

    const httpsCheck = report.results.find((r) => r.id === 'https_protocol');
    expect(httpsCheck?.status).toBe('fail');

    const viewportCheck = report.results.find((r) => r.id === 'viewport_meta');
    expect(viewportCheck?.status).toBe('fail');
  });

  it('generates a formatted markdown report', () => {
    const endpoints: EndpointResponses = {
      home: {
        ok: true,
        status: 200,
        time: 50,
        headers: { 'strict-transport-security': 'max-age=31536000' },
        body: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Sample Valid Title For Testing</title>
          </head>
          <body>
            <h1>Heading</h1>
          </body>
          </html>
        `,
      },
    };

    const report = evaluateBaselineAudit('https://sample.com', endpoints);
    const md = generateMarkdownReport(report);

    expect(md).toContain('# Website Baseline Audit Report: sample.com');
    expect(md).toContain('## Category Breakdown');
    expect(md).toContain('## Audit Findings');
    expect(md).toContain('Web Baseline Checker');
  });
});
