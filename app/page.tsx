import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
  description:
    'IQVerse: Free, open-source developer tools built in the browser. QR code generation, link scanning, test Regex, format JSON and more. All running 100% in your browser.',
};

const tools = [
  {
    name: 'AI Agents Scanner',
    slug: 'agentscan',
    category: 'UTILITIES',
    description: 'Scan your website for AI agent readiness. Checks robots.txt, sitemap, MCP, OAuth and more.',
    features: ['Comprehensive checks', 'Robots.txt validation', 'Sitemap detection', 'MCP verification'],
    icon: '/agentscan/logoX4.png',
  },
  {
    name: 'QR Forge',
    slug: 'qrforge',
    category: 'GENERATORS',
    description: 'Generate QR codes instantly in your browser without any data collection. SVG or PNG at any resolution.',
    features: ['Client-side generation', 'SVG & PNG export', 'Custom colors & logos', 'Multiple data types'],
    icon: '/qrforge/logoX4.png',
  },
  {
    name: 'Link Radar',
    slug: 'linkradar',
    category: 'UTILITIES',
    description: 'Scan webpages and detect broken links in seconds. Paste a URL and get instant 404 and redirect analysis.',
    features: ['Bulk link scanning', 'HTTP status detection', 'Redirect chain analysis', 'Exportable reports'],
    icon: '/linkradar/logoX4.png',
  },
  {
    name: 'Favicon Generator',
    slug: 'favicongen',
    category: 'GENERATORS',
    description: 'Generate all favicon sizes from a single image. Exports manifest.json and all icons needed for modern browsers.',
    features: ['All sizes in one click', 'SVG support', 'Web manifest generation', 'Browser preview'],
    icon: '/favicongen/logoX4.png',
  },
  {
    name: 'JSON Formatter',
    slug: 'json',
    category: 'FORMATTERS',
    description: 'Validate, format, minify and transform your JSON data. No servers, all in your browser.',
    features: ['Validate JSON', 'Pretty print', 'Minify', 'Sort keys', 'Statistics'],
    icon: '/json/logoX4.png',
  },
  {
    name: 'Regex Tester',
    slug: 'regex',
    category: 'TESTERS',
    description: 'Test regular expressions with instant feedback. Match patterns, validate input, and debug regex patterns.',
    features: ['Live matching', 'Pattern validation', 'Flag support', 'Match highlighting'],
    icon: '/regex/logoX4.png',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.pill}>Open Source</span>
          <span className={styles.pill}>Free Forever</span>
          <span className={styles.pill}>Browser-Based</span>
        </div>
        <h1 className={styles.title}>
          Tools built by
          <br />
          <em>developers</em>
          <br />
          for developers.
        </h1>
        <p className={styles.subtitle}>No logins. No paywalls. No telemetry.
          <br />Just tools that work, right in your browser.</p>
        <div className={styles.scrollHint}>scroll to explore ↓</div>
      </section>

      {/* Tools Section */}
      <section className={styles.toolsSection}>
        <div className="section-label">// tools</div>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link href={`/${tool.slug}/`} key={tool.slug}>
              <article className={styles.toolCard}>
                <div className={styles.toolMeta}>
                  <span className={styles.tag}>Open Source</span>
                  <span className={`${styles.tag} ${styles.tagLive}`}>Live</span>
                </div>
                <div className={styles.toolContent}>
                  <div className={styles.toolIcon}>
                    <img
                      src={tool.icon}
                      alt={`${tool.name} logo`}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div className={styles.toolBody}>
                    <h2 className={styles.toolTitle}>{tool.name}</h2>
                    <p className={styles.toolDesc}>{tool.description}</p>
                    <ul className={styles.toolFeatures}>
                      {tool.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.toolGlow}></div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
