import Link from 'next/link';
import React from 'react';
import styles from '@/styles/tool-layout.module.css';

interface ToolLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  pill?: string;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  subtitle,
  description,
  pill = 'TOOL',
  children,
}: ToolLayoutProps) {
  const initial = title.trim().charAt(0).toUpperCase() || 'T';

  return (
    <main className={styles.page}>
      <nav className={styles.topNav}>
        <Link className={styles.navLogo} href="/">
          <span className={styles.navLogoDot} />
          <span>IQVerse</span>
        </Link>

        <div className={styles.navBreadcrumb}>
          <span>Tools</span>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{title}</span>
        </div>

        <div className={styles.navRight}>
          <Link href="/">Home</Link>
          <a href="https://github.com/SekmenDev/iqverse.net" target="_blank" rel="noreferrer">
            Source
          </a>
        </div>
      </nav>

      <section className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerIcon} aria-hidden="true">
            {initial}
          </div>

          <div className={styles.headerText}>
            <div className={styles.headerMeta}>
              {pill && <span className={styles.pill}>{pill}</span>}
              <span className={`${styles.badge} ${styles.badgeLive}`}>Open source</span>
            </div>

            <h1 className={styles.title}>
              {title}
              {subtitle && <span className={styles.titleEm}> {subtitle}</span>}
            </h1>

            {description && <p className={styles.description}>{description}</p>}

            <div className={styles.headerActions}>
              <Link className={`${styles.btn} ${styles.btnGhost}`} href="/">
                Back home
              </Link>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href="https://github.com/SekmenDev/iqverse.net"
                target="_blank"
                rel="noreferrer"
              >
                View source
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.content}>{children}</section>
    </main>
  );
}
