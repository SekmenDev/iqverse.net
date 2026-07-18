'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { filterTools } from '@/lib/tools';
import styles from './not-found.module.css';

export default function NotFoundPage() {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const items = filterTools(query, 'all', 'all');
    return items.slice(0, 6);
  }, [query]);

  return (
    <div className={styles.pageShell}>
      <div className={styles.notFoundPage}>
        <section className={styles.heroBanner}>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>Page not found</span>
            <h1 className={styles.heroTitle}>
              Lost in the matrix? <span className={styles.titleAccent}>Let’s reroute it.</span>
            </h1>
            <p className={styles.heroText}>
              The page you were looking for has wandered off but the tools you need are still here.
              Search IQVerse for the right utility or jump straight to a useful shortcut below.
            </p>

            <div className={styles.heroActions}>
              <div className={styles.searchPanel}>
                <label htmlFor="404-search" className="sr-only">
                  Search tools
                </label>
                <div className={styles.searchBox}>
                  <span className={styles.searchIcon} aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <circle cx="6.5" cy="6.5" r="4.5" />
                      <path d="M10.5 10.5l3 3" />
                    </svg>
                  </span>
                  <input
                    id="404-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setQuery('');
                      }
                    }}
                    placeholder="Search tools, scanners, generators…"
                    className={styles.searchInput}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.searchHint}>
                  <span>Try “link radar”, “QR forge” or “JSON formatter”.</span>
                  <span>Press Esc to clear</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualContent}>
              <div className={styles.visualCard}>
                <div className={styles.visualBadge}>Navigation assist</div>
                <div className={styles.visualNumber}>404</div>
                <p className={styles.visualNote}>
                  While this page is gone, IQVerse still has lots of fast, browser-native tools for devs,
                  designers and engineering teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Quick access links</h2>
            <span className={styles.linkRow}>Need a shortcut? →</span>
          </div>

          <div className={styles.quickLinks}>
            <Link href="/linkradar/" className={styles.linkCard}>
              <h3 className={styles.linkCardTitle}>Link Radar</h3>
              <p className={styles.linkCardDesc}>
                Scan pages for broken links and 404s fast. Ideal when a missing page interrupts your review.
              </p>
            </Link>
            <Link href="/json/" className={styles.linkCard}>
              <h3 className={styles.linkCardTitle}>JSON Formatter</h3>
              <p className={styles.linkCardDesc}>
                Validate and clean up JSON instantly with one click, no uploads required.
              </p>
            </Link>
            <Link href="/qrforge/" className={styles.linkCard}>
              <h3 className={styles.linkCardTitle}>QR Forge</h3>
              <p className={styles.linkCardDesc}>
                Generate QR codes for links, credentials or quick sharing while you stay on track.
              </p>
            </Link>
            <Link href="/agentscan/" className={styles.linkCard}>
              <h3 className={styles.linkCardTitle}>AI Agents Scanner</h3>
              <p className={styles.linkCardDesc}>
                Check your site for agent-friendly metadata, robots, sitemaps and AI-ready headers.
              </p>
            </Link>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHead}>
            <h2>Suggested tools</h2>
            <span className={styles.linkRow}>{query ? 'Search results' : 'Popular picks'}</span>
          </div>

          <div className={styles.resultsGrid}>
            {suggestions.map((tool) => (
              <Link key={tool.name} href={tool.url || '/'} className={styles.resultCard}>
                <h3 className={styles.resultTitle}>{tool.name}</h3>
                <p className={styles.resultDesc}>{tool.desc}</p>
                <div className={styles.resultMeta}>
                  <span>Open</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
