'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './hacker.module.css';

export default function TerminalClient() {
  const [targetPath, setTargetPath] = useState('/wp-admin / wp-login.php');
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('SEC-AUDIT-3.9-LOGGED');
  const [timestamp, setTimestamp] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Calculate dynamic target path if passed via query string, referrer or location
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetParam = params.get('target') || params.get('path') || params.get('url');

      if (targetParam) {
        setTargetPath(targetParam);
      } else if (window.location.pathname && window.location.pathname !== '/hacker/' && window.location.pathname !== '/hacker') {
        setTargetPath(window.location.pathname);
      } else if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          setTargetPath(refUrl.pathname);
        } catch {
          // fallback
        }
      }

      // Generate session ID & timestamp
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSessionId(`SEC-ID-${randomHex}`);
      setTimestamp(new Date().toUTCString());
    }
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;

    let response = '';

    switch (cmd) {
      case 'help':
        response = `Available commands:
• scan     - Run simulated client vulnerability scan
• whoami   - Display client browser & session details
• tools    - List free IQVerse developer & security tools
• matrix   - Stream cyber matrix rain ASCII
• clear    - Clear terminal output buffer
• home     - Navigate back to home page`;
        break;
      case 'whoami':
        response = `[IDENTITY] User-Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
[SESSION] Token: ${sessionId}
[STATUS] Flagged as Security Probe • Action Logged`;
        break;
      case 'scan':
        response = `[SCANNING...]
[✓] Checking target ${targetPath}
[✓] Checking WordPress admin backdoors... None found (Serverless static runtime)
[✓] Checking SQL injection vulnerability... Protected (No database backend)
[✓] Security score: 100/100 • Zero surface area.`;
        break;
      case 'tools':
        response = `[IQVERSE DEV & SECURITY TOOLS]
• HeaderScan      - /headers/
• Link Radar      - /linkradar/
• AI Agent Scan   - /agentscan/
• SSL Inspector   - /ssl-inspector/
• Password Gen    - /password/`;
        break;
      case 'matrix':
        response = `01001001 01010001 01010110 01000101 01010010 01010011 01000101
███████████████████████████████████████████████████████
WAKE UP HACKER... THE MATRIX HAS YOU...
NO BACKDOORS HERE. ONLY SERIOUS PERFORMANCE & SECURITY.`;
        break;
      case 'clear':
        setCliLogs([]);
        setCliInput('');
        return;
      case 'home':
      case 'exit':
        window.location.href = '/';
        return;
      default:
        response = `Command not recognized: '${cmd}'. Type 'help' for command list.`;
    }

    setCliLogs((prev) => [...prev, `sekmen@iqverse:~$ ${cliInput}`, response]);
    setCliInput('');
  };

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalTitle}>
          <span className={styles.statusDot}></span>
          SEC_AUDIT_V3.9 // INTRUSION_DETECTION_ACTIVE
        </div>
        <div className={styles.brandLabel}>SEKMEN.DEV SECURITY</div>
      </div>

      <div className={styles.terminalBody}>
        {/* ASCII Art Logo matching attached screenshot */}
        <pre className={styles.asciiArt} aria-hidden="true">
{`  ██████╗ ██████╗ ██████╗     ██████╗  ██████╗ ██████╗ 
 ██╔════╝██╔═████╗██╔══██╗   ██╔════╝ ██╔════╝██╔═══██╗
 ███████╗██║██╔██║██████╔╝   ███████╗ ██║     ██║   ██║
 ╚════██║████╔╝██║██╔══██╗   ╚════██║ ██║     ██║   ██║
 ███████║╚██████╔╝██║  ██║   ███████║ ███████╗╚██████╔╝
 ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚══════╝ ╚══════╝ ╚═════╝ `}
        </pre>

        <div className={styles.logLine}>
          <span className={styles.prefix}>[SYSTEM]</span>
          <span>
            <span className={styles.alertTag}>SECURITY ALERT:</span> Unauthorized WordPress probe / hack vector detected.
          </span>
        </div>

        <div className={styles.logLine}>
          <span className={styles.prefix}>[TRACE]</span>
          <span>
            Requested Target: <span className={styles.targetPath} id="target-path">{targetPath}</span>
          </span>
        </div>

        <div className={styles.logLine}>
          <span className={styles.prefix}>[STATUS]</span>
          <span>
            <span className={styles.warnTag}>HTTP 403 ACCESS DENIED.</span> Nice try, hacker! 😉
          </span>
        </div>

        <div className={styles.logLine} style={{ marginTop: '8px' }}>
          <span className={styles.prefix}>[ANALYSIS]</span>
          <span>Looking for vulnerable, unpatched WordPress plugins, admin backdoors, or open secrets?</span>
        </div>

        <div className={styles.logLine}>
          <span className={styles.prefix}>[FACT]</span>
          <span>
            Sekmen.Dev &amp; IQVerse build custom, secure web applications &amp; tools from scratch to production — with zero PHP bloat, full change tracking, automated backups, and 100% reversibility.
          </span>
        </div>

        {timestamp && (
          <div className={styles.metaInfo}>
            <span>Session Ref: {sessionId}</span> • <span>Logged At: {timestamp}</span>
          </div>
        )}

        <div className={styles.commandPrompt}>
          <div className={styles.promptText}>
            <span className={styles.prefix}>sekmen@studio:~$</span> Choose your next command:<span className={styles.cursor}></span>
          </div>

          <div className={styles.actionsGrid}>
            <a
              href="https://sekmen.dev/wordpress/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionBtn} ${styles.primary}`}
            >
              <span>[1] View WordPress Services</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="https://sekmen.dev/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
            >
              <span>[2] Contact Security Team</span>
              <span aria-hidden="true">→</span>
            </a>
            <Link href="/" className={styles.actionBtn}>
              <span>[3] Explore IQVerse Tools</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/headers/" className={styles.actionBtn}>
              <span>[4] Scan Site Headers</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Interactive Shell Input */}
          <form onSubmit={handleCommandSubmit} className={styles.cliContainer}>
            <span className={styles.cliPrompt}>sekmen@iqverse:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type 'help', 'scan', 'whoami', 'tools'..."
              className={styles.cliInput}
              aria-label="Terminal command input"
            />
          </form>

          {cliLogs.length > 0 && (
            <div className={styles.cliOutput}>
              {cliLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
