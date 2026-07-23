'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tools, getUniqueCategories, getUniqueStatuses, filterTools, sortTools } from '@/lib/tools';
import type { Tool } from '@/lib/tools';
import styles from './catalog.module.css';

export default function Home() {
  const [activeQuery, setActiveQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'open' | 'saas' | 'coming'>('all');
  const [activeSort, setActiveSort] = useState<'default' | 'az'>('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable = !!target && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = useMemo(() => getUniqueCategories(), []);
  const statuses = useMemo(() => getUniqueStatuses(), []);

  const filtered = useMemo(() => {
    const items = filterTools(activeQuery, activeCat, activeStatus);
    return sortTools(items, activeSort);
  }, [activeQuery, activeCat, activeStatus, activeSort]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    categories.forEach(cat => {
      if (cat !== 'all') {
        counts[cat] = tools.filter(t => t.cat === cat).length;
      }
    });
    return counts;
  }, [categories]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tools.length };
    statuses.forEach(s => {
      if (s !== 'all') {
        counts[s] = tools.filter(t => t.type === s).length;
      }
    });
    return counts;
  }, [statuses]);

  const CAT_ICONS: Record<string, string> = {
    'AI & Agents': '🤖',
    'Browser Tools': '🧰',
    'Security': '🔒',
    'Design': '🎨',
    'Network': '🌐',
    'Desktop': '🖥️',
    'SaaS': '☁️',
  };

  const STATUS_ICONS = { open: '✦', saas: '◈', coming: '◌' };
  const STATUS_LABELS = { open: 'Open Source', saas: 'SaaS', coming: 'Coming Soon' };
  const DOT_CLASS = { open: styles.dotOpen, saas: styles.dotSaas, coming: styles.dotComing };

  const isEmoji = (s: string) => s.length <= 3 && /\p{Emoji}/u.test(s);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part) =>
      part.toLowerCase() === query.toLowerCase() ? `<mark>${part}</mark>` : part
    ).join('');
  };

  const renderToolCard = (tool: Tool, query: string) => {
    const coming = tool.type === 'coming';
    const href = tool.url && !coming ? tool.url : '';
    const isExternalLink = !!href && /^(https?:\/\/|mailto:)/i.test(href);

    const cardContent = (
      <div className={`${styles.card} ${coming ? styles.cardComing : ''}`}>
        <div className={styles.cardTop}>
          <div className={styles.cardIcon}>
            {isEmoji(tool.icon) ? (
              <span>{tool.icon}</span>
            ) : (
              <Image src={tool.icon} alt={tool.name} height={34} width={34} priority={false} />
            )}
          </div>
          <div className={styles.cardStatus}>
            <span className={`${styles.statusLabel} ${DOT_CLASS[tool.type]}`}>{STATUS_LABELS[tool.type]}</span>
          </div>
        </div>
        <div className={styles.cardName} dangerouslySetInnerHTML={{ __html: highlightText(tool.name, query) }} />
        <p className={styles.cardDesc} dangerouslySetInnerHTML={{ __html: highlightText(tool.desc, query) }} />
        <div className={styles.cardFooter}>
          <div className={styles.cardTags}>
            {tool.tags.split(' ').slice(0, 3).map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
          {!coming && href && (
            <span className={styles.cardArrow} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M8 3l5 5-5 5" />
              </svg>
            </span>
          )}
        </div>
      </div>
    );

    if (!href || coming) {
      return <div key={tool.name} className={styles.cardLink}>{cardContent}</div>;
    }

    if (isExternalLink) {
      return (
        <a href={href} key={tool.name} className={styles.cardLink} target="_blank" rel="noopener noreferrer">
          {cardContent}
        </a>
      );
    }

    return (
      <Link href={href} key={tool.name} className={styles.cardLink}>
        {cardContent}
      </Link>
    );
  };

  const showGrouped = activeSort !== 'az' && activeCat === 'all' && !activeQuery;

  const groupedTools = useMemo(() => {
    if (!showGrouped) {
      return {};
    }
    const groups: Record<string, Tool[]> = {};
    filtered.forEach(t => {
      if (!groups[t.cat]) groups[t.cat] = [];
      groups[t.cat].push(t);
    });
    return groups;
  }, [filtered, showGrouped]);

  let content = null;

  if (filtered.length === 0) {
    content = (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>No tools found</h3>
        <p>Try a different search or filter.</p>
      </div>
    );
  } else if (showGrouped) {
    content = (
      <>
        {Object.entries(groupedTools).map(([cat, tools]) => (
          <div key={cat}>
            <p className={styles.sectionHead}>
              {CAT_ICONS[cat] || ''} {cat}
            </p>
            <div className={styles.cardGrid}>
              {tools.map(t => renderToolCard(t, activeQuery))}
            </div>
          </div>
        ))}
      </>
    );
  } else {
    content = (
      <div className={styles.cardGrid}>
        {filtered.map(t => renderToolCard(t, activeQuery))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* TOP NAV */}
      <nav className={styles.topNav}>
        <button
          className={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        <Link href="/" className={styles.navLogo}>
          <span className={styles.navLogoDot}></span> IQVerse
        </Link>

        <div className={styles.navSearchWrap}>
          <span className={styles.navSearchIcon}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10.5 10.5l3 3" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            id="search"
            type="text"
            placeholder="Search tools… (press /)"
            value={activeQuery}
            onChange={(e) => setActiveQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            className={styles.navSearch}
            aria-label="Search tools"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setActiveQuery('');
              }
            }}
          />
          <span className={styles.searchKbd}>/</span>
        </div>

        <div className={styles.navRight}>
          <a
            href="https://github.com/SekmenDev/iqverse.net"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      <button className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayShow : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className={styles.layout}>
        {/* SIDEBAR */}
        <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Tool categories">
          <span className={styles.sidebarLabel}>Categories</span>
          <div>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.catBtn} ${activeCat === cat ? styles.catBtnActive : ''}`}
                onClick={() => {
                  setActiveCat(cat);
                  setSidebarOpen(false);
                }}
              >
                <span className={styles.catIcon}>{cat === 'all' ? '⊞' : (CAT_ICONS[cat] || '○')}</span>
                <span style={{ flex: 1 }}>{cat === 'all' ? 'All Tools' : cat}</span>
                <span className={styles.catCount}>{catCounts[cat]}</span>
              </button>
            ))}
          </div>

          <span className={styles.sidebarLabel}>Status</span>
          <div>
            {statuses.map(s => (
              <button
                key={s}
                className={`${styles.catBtn} ${activeStatus === s ? styles.catBtnActive : ''}`}
                onClick={() => {
                  setActiveStatus(s as any);
                  setSidebarOpen(false);
                }}
              >
                <span
                  className={`${styles.catIcon} ${s !== 'all' ? DOT_CLASS[s as keyof typeof DOT_CLASS] : ''}`}
                >
                  {s === 'all' ? '⊞' : STATUS_ICONS[s as keyof typeof STATUS_ICONS]}
                </span>
                <span style={{ flex: 1 }}>{s === 'all' ? 'All' : STATUS_LABELS[s as keyof typeof STATUS_LABELS]}</span>
                <span className={styles.catCount}>{statusCounts[s]}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* MAIN */}
        <main className={styles.main} id="main-content">
          <div className={styles.toolbar}>
            <span className={styles.resultCount}>
              <strong>{filtered.length}</strong> tool{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.sortWrap} aria-label="Sort options">
              <button
                className={`${styles.sortBtn} ${activeSort === 'default' ? styles.sortBtnActive : ''}`}
                onClick={() => setActiveSort('default')}
                aria-pressed={activeSort === 'default'}
              >
                Default
              </button>
              <button
                className={`${styles.sortBtn} ${activeSort === 'az' ? styles.sortBtnActive : ''}`}
                onClick={() => setActiveSort('az')}
                aria-pressed={activeSort === 'az'}
              >
                A-Z
              </button>
            </div>
          </div>

          <div id="content-area">{content}</div>
        </main>
      </div>
    </div>
  );
}
