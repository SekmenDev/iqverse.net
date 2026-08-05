import ThemeToggle from './ThemeToggle';
import styles from '@/styles/saas-landing.module.css';

export interface LandingCard {
  title: string;
  description: string;
  icon: string;
}

export interface LandingBullet {
  title: string;
  description: string;
}

export interface LandingStat {
  label: string;
  value: string;
  tone?: 'accent' | 'green' | 'amber';
}

export interface SaasLandingPageProps {
  brand: string;
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  heroHighlights: string[];
  heroStats: LandingStat[];
  trustLogos: string[];
  challengeTitle: string;
  challengeSubtitle: string;
  challengeCards: LandingCard[];
  solutionTitle: string;
  solutionSubtitle: string;
  solutionBullets: LandingBullet[];
  featuresTitle: string;
  featuresSubtitle: string;
  featureCards: LandingCard[];
  footerText: string;
  appUrl?: string;
}

export default function SaasLandingPage({
  brand,
  eyebrow,
  heroTitle,
  heroAccent,
  heroSubtitle,
  heroHighlights,
  heroStats,
  trustLogos,
  challengeTitle,
  challengeSubtitle,
  challengeCards,
  solutionTitle,
  solutionSubtitle,
  solutionBullets,
  featuresTitle,
  featuresSubtitle,
  featureCards,
  footerText,
  appUrl,
}: SaasLandingPageProps) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark}>{brand.slice(0, 1)}</span>
          <span>{brand}</span>
        </a>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#solution">Benefits</a>
          <a href="#contact">Contact</a>
        </div>
        <div className={styles.navRight}>
          <ThemeToggle />
          <a
            className={styles.navCta}
            href={appUrl || "#contact"}
            {...(appUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            Request a Demo ↗
          </a>
        </div>
      </nav>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.tag}>{eyebrow}</span>
            <h1>
              {heroTitle}
              <span className={styles.heroAccent}> {heroAccent}</span>
            </h1>
            <p>{heroSubtitle}</p>
            <div className={styles.heroActions}>
              <a
                className={styles.btnPrimary}
                href={appUrl || "#contact"}
                {...(appUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                Get Started ↗
              </a>
              <a className={styles.btnSecondary} href="#features">
                Explore Features
              </a>
            </div>
            <div className={styles.highlightList}>
              {heroHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className={styles.heroPreview}>
            <div className={styles.previewBar}>
              <span>{brand} Workspace</span>
              <span>Live Overview</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.statGrid}>
                {heroStats.map((stat) => (
                  <div key={stat.label} className={`${styles.statCard} ${styles[stat.tone ?? 'accent']}`}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.previewList}>
                {heroHighlights.map((item) => (
                  <div key={item} className={styles.previewRow}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustSection}>
          <p>Trusted by modern teams and growing organizations</p>
          <div className={styles.logoRow}>
            {trustLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className={styles.section} id="challenge">
          <div className={styles.sectionHeader}>
            <span className={styles.subtleLabel}>The Challenge</span>
            <h2>{challengeTitle}</h2>
            <p>{challengeSubtitle}</p>
          </div>
          <div className={styles.cardGrid}>
            {challengeCards.map((card) => (
              <article key={card.title} className={styles.card}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionAlt} id="solution">
          <div className={styles.sectionHeader}>
            <span className={styles.subtleLabel}>The Solution</span>
            <h2>{solutionTitle}</h2>
            <p>{solutionSubtitle}</p>
          </div>
          <div className={styles.solutionBox}>
            {solutionBullets.map((bullet) => (
              <div key={bullet.title} className={styles.bulletRow}>
                <span className={styles.bulletCheck}>✓</span>
                <div>
                  <h3>{bullet.title}</h3>
                  <p>{bullet.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="features">
          <div className={styles.sectionHeader}>
            <span className={styles.subtleLabel}>Features</span>
            <h2>{featuresTitle}</h2>
            <p>{featuresSubtitle}</p>
          </div>
          <div className={styles.cardGrid}>
            {featureCards.map((card) => (
              <article key={card.title} className={styles.card}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="contact">
        <h2>{brand}</h2>
        <p>{footerText}</p>
        <a
          className={styles.btnPrimary}
          href={appUrl || "mailto:hello@iqverse.net"}
          {...(appUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {appUrl ? "Visit App ↗" : "hello@iqverse.net"}
        </a>
      </footer>
    </div>
  );
}
