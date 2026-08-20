export interface WebhookSample {
  headers: string;
  body: string;
}

export const SAMPLE_WEBHOOKS: Record<string, WebhookSample> = {
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

export async function computeWebhookHmacSha256(secret: string, body: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API is not available');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const bodyData = encoder.encode(body);
  const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, bodyData);
  const computedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `sha256=${computedHex}`;
}

export function generateCurlFromWebhook(
  targetUrl: string,
  headersStr: string,
  bodyStr: string
): string {
  let curl = `curl -X POST "${targetUrl}" \\\n`;
  headersStr
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((header) => {
      curl += `  -H "${header.replace(/"/g, '\\"')}" \\\n`;
    });
  curl += `  -d '${bodyStr.replace(/'/g, "'\\''")}'`;
  return curl;
}
