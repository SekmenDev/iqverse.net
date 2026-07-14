import type { Metadata } from 'next';
import JSONFormatter from '@/components/tools/JSONFormatter';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator',
  description:
    'Format and validate your JSON data with ease. Check for syntax errors, pretty-print your JSON and ensure it\'s valid. All in the browser, no uploads needed.',
  openGraph: {
    title: 'JSON Formatter & Validator',
    description: 'Format and validate your JSON data with ease.',
    url: 'https://iqverse.net/json/',
  },
};

export default function JSONFormatterPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span className="pill">JSON TOOLS</span>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          JSON <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Formatter & Validator</em>
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            maxWidth: '700px',
          }}
        >
          Validate, format, minify and transform your JSON data. No servers, no tracking, all in your browser.
        </p>
      </div>

      <JSONFormatter />
    </main>
  );
}
