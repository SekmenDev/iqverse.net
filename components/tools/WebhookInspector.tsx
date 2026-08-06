'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const SAMPLE_WEBHOOKS: Record<string, { headers: string; body: string }> = {
  GitHub: {
    headers: `Host: iqverse.net
User-Agent: GitHub-Hookshot/abc123
X-GitHub-Event: push
X-GitHub-Delivery: 72d42c60-a15d-11ee-8e8e-123456789abc
X-Hub-Signature-256: sha256=d7a8fbb307d7809469ca9abecb11e055f25a6db83163407238aae6e10617c69d
Content-Type: application/json`,
    body: `{
  "ref": "refs/heads/main",
  "repository": {
    "name": "iqverse.net",
    "full_name": "iqverse/iqverse.net"
  },
  "pusher": {
    "name": "octocat",
    "email": "octocat@github.com"
  }
}`,
  },
  Stripe: {
    headers: `Host: iqverse.net
User-Agent: Stripe/1.0 (+https://stripe.com/docs/webhooks)
Stripe-Signature: t=1700000000,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56d9d5328c30a4471292
Content-Type: application/json`,
    body: `{
  "id": "evt_1N23456789",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_12345",
      "amount": 2900,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}`,
  },
};

export default function WebhookInspector() {
  const [headersText, setHeadersText] = useState(SAMPLE_WEBHOOKS.GitHub.headers);
  const [bodyText, setBodyText] = useState(SAMPLE_WEBHOOKS.GitHub.body);
  const [secretKey, setSecretKey] = useState('secret_webhook_key_123');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const loadSample = (name: string) => {
    if (SAMPLE_WEBHOOKS[name]) {
      setHeadersText(SAMPLE_WEBHOOKS[name].headers);
      setBodyText(SAMPLE_WEBHOOKS[name].body);
      setVerificationResult(null);
    }
  };

  const verifySignature = async () => {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const bodyData = encoder.encode(bodyText.trim());
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);
      const computedHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setVerificationResult(`Computed HMAC SHA-256 Digest: sha256=${computedHex}`);
    } catch (err) {
      setVerificationResult(`Signature Verification Error: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ maxWidth: 1050 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Load Sample Payload:</span>
            {Object.keys(SAMPLE_WEBHOOKS).map((name) => (
              <button
                key={name}
                type="button"
                className={sharedStyles.button}
                onClick={() => loadSample(name)}
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                {name} Webhook
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="whHeaders">
                HTTP Request Headers
              </label>
              <textarea
                id="whHeaders"
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                className={sharedStyles.textarea}
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="whBody">
                Webhook Payload (JSON Body)
              </label>
              <textarea
                id="whBody"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className={sharedStyles.textarea}
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Signature Verifier */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color, #333)',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0' }}>HMAC Signature Calculator & Verifier</h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className={sharedStyles.input}
                placeholder="Enter Webhook Signing Secret"
                style={{ flex: 1, minWidth: 220 }}
              />
              <button
                type="button"
                className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                onClick={verifySignature}
              >
                Compute Signature Digest
              </button>
            </div>

            {verificationResult && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 6,
                  background: 'rgba(0,0,0,0.3)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#4caf50',
                }}
              >
                {verificationResult}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
