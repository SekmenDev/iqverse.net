import { describe, it, expect } from 'vitest';
import {
  extractHtmlSignals,
  evaluateBaselineAudit,
  generateMarkdownReport,
  type EndpointResponses,
} from '@/lib/web-baseline';

describe('lib/web-baseline.ts - HTML Signals Extraction', () => {
  it('extracts head metadata: title, description, viewport, charset, canonical, htmlLang, favicon, author, doctype', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>IQVerse — Developer Tools</title>
        <meta name="description" content="Free open-source tools for developers and creators." />
        <meta name="author" content="IQVerse Core Team" />
        <link rel="canonical" href="https://iqverse.net/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="author" href="/humans.txt" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <h1>Main Heading</h1>
      </body>
      </html>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.hasDoctype).toBe(true);
    expect(signals.htmlLang).toBe('en-US');
    expect(signals.charset).toBe('utf-8');
    expect(signals.viewport).toBe('width=device-width, initial-scale=1.0');
    expect(signals.title).toBe('IQVerse — Developer Tools');
    expect(signals.metaDescription).toBe('Free open-source tools for developers and creators.');
    expect(signals.author).toBe('IQVerse Core Team');
    expect(signals.authorLink).toBe('/humans.txt');
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

  it('audits anchor links for valid, empty, and unsafe target=_blank hrefs', () => {
    const html = `
      <a href="https://example.com">Valid</a>
      <a href="/docs">Docs</a>
      <a href="#">Placeholder</a>
      <a href="">Empty</a>
      <a href="https://external.com" target="_blank" rel="noopener noreferrer">Safe external</a>
      <a href="https://insecure.com" target="_blank">Unsafe external</a>
    `;

    const signals = extractHtmlSignals(html);
    expect(signals.linksCount).toBe(6);
    expect(signals.emptyLinksCount).toBe(2);
    expect(signals.unsafeBlankLinksCount).toBe(1);
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

  it('identifies robots directives: index, noindex, nofollow', () => {
    const noindexHtml = `<meta name="robots" content="noindex, nofollow" />`;
    const signalsNoindex = extractHtmlSignals(noindexHtml);
    expect(signalsNoindex.isNoindex).toBe(true);
    expect(signalsNoindex.isNofollow).toBe(true);
    expect(signalsNoindex.robotsMeta).toBe('noindex, nofollow');

    const indexHtml = `<meta name="robots" content="INDEX, FOLLOW" />`;
    const signalsIndex = extractHtmlSignals(indexHtml);
    expect(signalsIndex.isNoindex).toBe(false);
    expect(signalsIndex.isNofollow).toBe(false);
    expect(signalsIndex.robotsMeta).toBe('INDEX, FOLLOW');
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
            <meta name="author" content="IQVerse Team">
            <meta name="robots" content="index, follow">
            <link rel="canonical" href="https://iqverse.net/">
            <link rel="icon" href="/favicon.svg">
            <link rel="author" href="/humans.txt">
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
              <a href="https://github.com/iqverse" target="_blank" rel="noopener noreferrer">GitHub</a>
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
      humans: {
        ok: true,
        status: 200,
        body: '/* TEAM */\nDeveloper: IQVerse\nSite: https://iqverse.net',
      },
      securityTxt: {
        ok: true,
        status: 200,
        body: 'Contact: mailto:security@iqverse.net\nExpires: 2027-12-31T23:59:59.000Z',
      },
    };

    const report = evaluateBaselineAudit('https://iqverse.net', endpoints);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.grade).toBe('A+');
    expect(report.passedCount).toBeGreaterThanOrEqual(23);
    expect(report.failCount).toBe(0);

    const authorCheck = report.results.find((r) => r.id === 'meta_author');
    expect(authorCheck?.status).toBe('pass');

    const humansCheck = report.results.find((r) => r.id === 'humans_txt');
    expect(humansCheck?.status).toBe('pass');

    const robotsCheck = report.results.find((r) => r.id === 'robots_meta_indexable');
    expect(robotsCheck?.status).toBe('pass');
    expect(robotsCheck?.found).toContain('Explicit crawler directives declared');

    const doctypeCheck = report.results.find((r) => r.id === 'html_doctype');
    expect(doctypeCheck?.status).toBe('pass');

    const secTxtCheck = report.results.find((r) => r.id === 'security_txt');
    expect(secTxtCheck?.status).toBe('pass');

    const blankCheck = report.results.find((r) => r.id === 'target_blank_security');
    expect(blankCheck?.status).toBe('pass');
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

    const doctypeCheck = report.results.find((r) => r.id === 'html_doctype');
    expect(doctypeCheck?.status).toBe('fail');
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

  it('correctly handles document with no title or empty title tag', () => {
    const noTitleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body><h1>Content</h1></body>
      </html>
    `;
    const signalsNoTitle = extractHtmlSignals(noTitleHtml);
    expect(signalsNoTitle.title).toBeNull();

    const reportNoTitle = evaluateBaselineAudit('https://nakshibendi-ks.com', {
      home: { ok: true, status: 200, body: noTitleHtml, headers: {} },
    });
    const titleCheck = reportNoTitle.results.find((r) => r.id === 'page_title');
    expect(titleCheck?.status).toBe('fail');
    expect(titleCheck?.found).toBe('Missing <title> tag in HTML document.');

    const emptyTitleHtml = `<html><head><title>   </title></head><body><h1>Content</h1></body></html>`;
    const signalsEmptyTitle = extractHtmlSignals(emptyTitleHtml);
    expect(signalsEmptyTitle.title).toBe('');

    const reportEmptyTitle = evaluateBaselineAudit('https://nakshibendi-ks.com', {
      home: { ok: true, status: 200, body: emptyTitleHtml, headers: {} },
    });
    const emptyTitleCheck = reportEmptyTitle.results.find((r) => r.id === 'page_title');
    expect(emptyTitleCheck?.status).toBe('fail');
  });
});
