'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface RuleGroup {
  userAgent: string;
  disallows: string[];
  allows: string[];
  crawlDelay?: string;
}

export default function RobotsGenerator() {
  const [sitemapUrl, setSitemapUrl] = useState('https://iqverse.net/sitemap.xml');
  const [groups, setGroups] = useState<RuleGroup[]>([
    {
      userAgent: '*',
      disallows: ['/admin/', '/private/'],
      allows: ['/public/'],
    },
    {
      userAgent: 'GPTBot',
      disallows: ['/private-data/'],
      allows: ['/'],
    },
  ]);

  // Validator test state
  const [testPath, setTestPath] = useState('/admin/dashboard');
  const [testAgent, setTestAgent] = useState('*');
  const [testResult, setTestResult] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const addGroup = () => {
    setGroups([...groups, { userAgent: 'Googlebot', disallows: ['/tmp/'], allows: ['/'] }]);
  };

  const removeGroup = (idx: number) => {
    setGroups(groups.filter((_, i) => i !== idx));
  };

  const updateUa = (idx: number, ua: string) => {
    const updated = [...groups];
    updated[idx].userAgent = ua;
    setGroups(updated);
  };

  const addRule = (groupIdx: number, type: 'disallows' | 'allows') => {
    const updated = [...groups];
    updated[groupIdx][type].push(type === 'disallows' ? '/secret/' : '/');
    setGroups(updated);
  };

  const updateRule = (groupIdx: number, type: 'disallows' | 'allows', ruleIdx: number, val: string) => {
    const updated = [...groups];
    updated[groupIdx][type][ruleIdx] = val;
    setGroups(updated);
  };

  const removeRule = (groupIdx: number, type: 'disallows' | 'allows', ruleIdx: number) => {
    const updated = [...groups];
    updated[groupIdx][type] = updated[groupIdx][type].filter((_, i) => i !== ruleIdx);
    setGroups(updated);
  };

  const generateRobotsTxt = (): string => {
    let txt = '';
    groups.forEach((g) => {
      txt += `User-agent: ${g.userAgent.trim() || '*'}\n`;
      g.disallows.forEach((d) => {
        if (d.trim()) txt += `Disallow: ${d.trim()}\n`;
      });
      g.allows.forEach((a) => {
        if (a.trim()) txt += `Allow: ${a.trim()}\n`;
      });
      if (g.crawlDelay) txt += `Crawl-delay: ${g.crawlDelay.trim()}\n`;
      txt += '\n';
    });

    if (sitemapUrl.trim()) {
      txt += `Sitemap: ${sitemapUrl.trim()}\n`;
    }

    return txt.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateRobotsTxt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateRobotsTxt()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const testDirective = () => {
    const targetGroup = groups.find((g) => g.userAgent.toLowerCase() === testAgent.toLowerCase()) || groups.find((g) => g.userAgent === '*');
    if (!targetGroup) {
      setTestResult('Allowed (No matching directives)');
      return;
    }

    const path = testPath.trim();
    const disallowedMatch = targetGroup.disallows.find((d) => d.trim() && path.startsWith(d.trim()));
    const allowedMatch = targetGroup.allows.find((a) => a.trim() && path.startsWith(a.trim()));

    if (disallowedMatch && (!allowedMatch || disallowedMatch.length >= allowedMatch.length)) {
      setTestResult(`Blocked (Disallow: ${disallowedMatch})`);
    } else {
      setTestResult('Allowed (Access granted)');
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="sitemapInput">
              Sitemap URL Reference
            </label>
            <input
              id="sitemapInput"
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className={sharedStyles.input}
              placeholder="https://example.com/sitemap.xml"
            />
          </div>

          <div style={{ marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>User-Agent Directive Groups</h3>
              <button type="button" className={sharedStyles.button} onClick={addGroup}>
                + Add User-Agent Group
              </button>
            </div>

            {groups.map((group, gIdx) => (
              <div
                key={gIdx}
                style={{
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>User-agent:</label>
                  <input
                    type="text"
                    value={group.userAgent}
                    onChange={(e) => updateUa(gIdx, e.target.value)}
                    className={sharedStyles.input}
                    placeholder="* or Googlebot or GPTBot"
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => removeGroup(gIdx)}
                    style={{ color: '#ff4d4f' }}
                  >
                    Delete Group
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: 6 }}>Disallow Paths</label>
                    {group.disallows.map((d, dIdx) => (
                      <div key={dIdx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input
                          type="text"
                          value={d}
                          onChange={(e) => updateRule(gIdx, 'disallows', dIdx, e.target.value)}
                          className={sharedStyles.input}
                          placeholder="/path/"
                        />
                        <button type="button" className={sharedStyles.button} onClick={() => removeRule(gIdx, 'disallows', dIdx)}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button" className={sharedStyles.button} onClick={() => addRule(gIdx, 'disallows')} style={{ fontSize: '0.75rem' }}>
                      + Disallow
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: 6 }}>Allow Paths</label>
                    {group.allows.map((a, aIdx) => (
                      <div key={aIdx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input
                          type="text"
                          value={a}
                          onChange={(e) => updateRule(gIdx, 'allows', aIdx, e.target.value)}
                          className={sharedStyles.input}
                          placeholder="/path/"
                        />
                        <button type="button" className={sharedStyles.button} onClick={() => removeRule(gIdx, 'allows', aIdx)}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button" className={sharedStyles.button} onClick={() => addRule(gIdx, 'allows')} style={{ fontSize: '0.75rem' }}>
                      + Allow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Path Tester */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color, #333)',
              marginBottom: 24,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0' }}>Path Rule Tester</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={testAgent}
                onChange={(e) => setTestAgent(e.target.value)}
                className={sharedStyles.input}
                placeholder="User-Agent (*)"
                style={{ width: 140 }}
              />
              <input
                type="text"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                className={sharedStyles.input}
                placeholder="Path to test (/admin/dashboard)"
                style={{ flex: 1, minWidth: 200 }}
              />
              <button type="button" className={sharedStyles.button} onClick={testDirective}>
                Test Path Access
              </button>
            </div>
            {testResult && (
              <div style={{ marginTop: 10, fontSize: '0.9rem', color: testResult.startsWith('Allowed') ? '#4caf50' : '#ff4d4f' }}>
                <strong>{testResult}</strong>
              </div>
            )}
          </div>

          {/* Output */}
          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="robotsOutput">
                Generated robots.txt Output
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy robots.txt'}
                </button>
                <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleDownload}>
                  Download File
                </button>
              </div>
            </div>
            <textarea
              id="robotsOutput"
              readOnly
              value={generateRobotsTxt()}
              className={sharedStyles.outputArea}
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
