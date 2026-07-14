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
  return (
    <main className={styles.container}>
      {/* Tool Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          {pill && <span className={styles.pill}>{pill}</span>}
        </div>
        <h1 className={styles.title}>
          {title}
          {subtitle && <em> {subtitle}</em>}
        </h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* Tool Content */}
      <div className={styles.content}>{children}</div>
    </main>
  );
}
