import { describe, it, expect } from 'vitest';
import {
  extractJsonLdFromHtml,
  decodeHtmlEntities,
  cleanJsonLdString,
  validateSchema,
  extractAndValidateAllFromHtml,
} from '@/lib/schema-validator';

describe('lib/schema-validator.ts', () => {
  describe('decodeHtmlEntities', () => {
    it('decodes HTML entities properly', () => {
      const input = '&quot;name&quot;: &apos;IQVerse&apos; &amp; &lt;tools&gt;';
      expect(decodeHtmlEntities(input)).toBe('"name": \'IQVerse\' & <tools>');
    });
  });

  describe('cleanJsonLdString', () => {
    it('strips script tags and CDATA wrappers', () => {
      const input = '<script type="application/ld+json">/* <![CDATA[ */ {"@context":"https://schema.org","@type":"Article"} /* ]]> */</script>';
      const cleaned = cleanJsonLdString(input);
      expect(cleaned).toBe('{"@context":"https://schema.org","@type":"Article"}');
    });

    it('handles clean json strings without modifying', () => {
      const input = '{"@context":"https://schema.org","@type":"WebSite"}';
      expect(cleanJsonLdString(input)).toBe(input);
    });
  });

  describe('extractJsonLdFromHtml', () => {
    it('extracts all ld+json blocks from an HTML page', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Page</title>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IQVerse"
            }
          </script>
          <script type="text/javascript">
            console.log("ignore me");
          </script>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SekmenDev"
            }
          </script>
        </head>
        <body>
          <h1>Hello</h1>
        </body>
        </html>
      `;

      const results = extractJsonLdFromHtml(html);
      expect(results).toHaveLength(2);
      expect(results[0]).toContain('"@type": "WebSite"');
      expect(results[1]).toContain('"@type": "Organization"');
    });

    it('returns empty array when no JSON-LD is found', () => {
      expect(extractJsonLdFromHtml('<html><body>No scripts here</body></html>')).toEqual([]);
      expect(extractJsonLdFromHtml('')).toEqual([]);
    });
  });

  describe('validateSchema', () => {
    it('validates a correct Article schema', () => {
      const json = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        image: 'https://example.com/photo.jpg',
        datePublished: '2026-01-01',
        author: { '@type': 'Person', name: 'Author Name' },
      });

      const res = validateSchema(json);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.types).toContain('Article');
      expect(res.properties).toContain('headline');
      expect(res.properties).toContain('author');
    });

    it('catches syntax errors', () => {
      const res = validateSchema('{ invalid json }');
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toMatch(/JSON Syntax Error/);
    });

    it('catches missing @context and @type', () => {
      const res = validateSchema(JSON.stringify({ name: 'Some Name' }));
      expect(res.valid).toBe(false);
      expect(res.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Missing required '@context'"),
          expect.stringContaining("Missing required '@type'"),
        ])
      );
    });

    it('validates schema within @graph container', () => {
      const graph = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'IQVerse',
            url: 'https://iqverse.net',
          },
          {
            '@type': 'Organization',
            name: 'IQVerse Org',
            url: 'https://iqverse.net',
          },
        ],
      };

      const res = validateSchema(JSON.stringify(graph));
      expect(res.valid).toBe(true);
      expect(res.types).toEqual(expect.arrayContaining(['WebSite', 'Organization']));
      expect(res.itemCount).toBe(2);
    });

    it('handles empty input gracefully', () => {
      const res = validateSchema('');
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Input is empty');
    });

    it('emits warnings for missing recommended properties', () => {
      const json = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Super Gadget',
      });

      const res = validateSchema(json);
      expect(res.valid).toBe(true); // Still valid schema but has warnings
      expect(res.warnings.some((w) => w.includes("'image' is missing"))).toBe(true);
      expect(res.warnings.some((w) => w.includes("'offers' is missing"))).toBe(true);
    });
  });

  describe('extractAndValidateAllFromHtml', () => {
    it('extracts and validates all blocks with detailed result items', () => {
      const html = `
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Why?","acceptedAnswer":{"@type":"Answer","text":"Because."}}]}
        </script>
      `;

      const items = extractAndValidateAllFromHtml(html);
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('FAQPage');
      expect(items[0].validation.valid).toBe(true);
      expect(items[0].index).toBe(1);
    });
  });
});
