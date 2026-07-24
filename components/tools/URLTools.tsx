'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function parseQueryText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split('=');
      return { key: key.trim(), value: rest.join('=').trim() };
    });
}

function formatQueryText(params: URLSearchParams) {
  return Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export default function URLTools() {
  const [inputUrl, setInputUrl] = useState('https://example.com/path?foo=1&bar=two#section');
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [protocol, setProtocol] = useState('https:');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('example.com');
  const [port, setPort] = useState('');
  const [pathname, setPathname] = useState('/path');
  const [queryText, setQueryText] = useState('foo=1\nbar=two');
  const [hash, setHash] = useState('#section');

  const parseUrl = () => {
    setError('');
    try {
      const candidate = inputUrl.trim() || 'https://example.com';
      const url = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
      setProtocol(url.protocol);
      setUsername(url.username);
      setPassword(url.password);
      setHost(url.hostname);
      setPort(url.port);
      setPathname(url.pathname);
      setQueryText(formatQueryText(url.searchParams));
      setHash(url.hash);
      setOutputUrl(url.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL.');
      setOutputUrl('');
    }
  };

  const buildUrl = () => {
    setError('');
    try {
      const base = `${protocol}//${host}${port ? `:${port}` : ''}`;
      const url = new URL(pathname || '/', base);
      url.username = username;
      url.password = password;
      url.hash = hash.startsWith('#') || hash === '' ? hash : `#${hash}`;
      const params = new URLSearchParams();
      parseQueryText(queryText).forEach(({ key, value }) => {
        if (key) params.append(key, value);
      });
      url.search = params.toString();
      setOutputUrl(url.href);
      setInputUrl(url.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to build URL.');
      setOutputUrl('');
    }
  };

  const encodeUrl = () => {
    try {
      setError('');
      setOutputUrl(encodeURI(inputUrl.trim()));
    } catch {
      setError('Unable to encode the URL.');
    }
  };

  const decodeUrl = () => {
    try {
      setError('');
      setOutputUrl(decodeURI(inputUrl.trim()));
    } catch {
      setError('Unable to decode the URL.');
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>URL Tools</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlInput">
              URL Input
            </label>
            <textarea
              id="urlInput"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className={sharedStyles.textarea}
              rows={4}
            />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={parseUrl}>
              Parse URL
            </button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={buildUrl}>
              Build URL
            </button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={encodeUrl}>
              Encode URL
            </button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={decodeUrl}>
              Decode URL
            </button>
          </div>

          <div className={sharedStyles.sectionLabel} style={{ marginTop: 24 }}>
            Parsed URL Parts
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlProtocol">Protocol</label>
            <input
              id="urlProtocol"
              type="text"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlHost">Hostname</label>
            <input
              id="urlHost"
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlPort">Port</label>
            <input
              id="urlPort"
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlPathname">Pathname</label>
            <input
              id="urlPathname"
              type="text"
              value={pathname}
              onChange={(e) => setPathname(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlHash">Hash</label>
            <input
              id="urlHash"
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlQueryParams">Query Parameters</label>
            <textarea
              id="urlQueryParams"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className={sharedStyles.textarea}
              rows={5}
              placeholder="key=value\nfoo=bar"
            />
          </div>

          <div style={{ marginTop: 18 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="urlOutput">Output URL</label>
            <textarea id="urlOutput" readOnly value={outputUrl} className={sharedStyles.outputArea} rows={4} />
          </div>

          {error && (
            <div className={sharedStyles.errorCard} style={{ marginTop: 12 }}>
              <div className={sharedStyles.errorMessage}>{error}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
