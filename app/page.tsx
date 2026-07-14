import type { Metadata } from 'next';
import Link from 'next/link';
import { tools } from '@/lib/tools';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
  description:
    'IQVerse: Free, open-source developer tools built in the browser. QR code generation, link scanning, test Regex, format JSON and more. All running 100% in your browser.',
};

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
