export interface CurlRequest {
  method: string;
  url: string;
  headers: Array<[string, string]>;
  body: string | null;
  bodyKind: 'none' | 'json' | 'form' | 'raw';
  auth: { user: string; password: string } | null;
  insecure: boolean;
  followRedirects: boolean;
}

export type CurlResult = { ok: true; request: CurlRequest } | { ok: false; error: string };

const FLAGS_WITH_VALUE = new Set([
  '-X', '--request',
  '-H', '--header',
  '-d', '--data', '--data-raw', '--data-binary', '--data-ascii', '--data-urlencode',
  '-F', '--form',
  '-u', '--user',
  '-b', '--cookie',
  '-A', '--user-agent',
  '-e', '--referer',
  '--url',
  '-o', '--output',
  '-m', '--max-time',
  '--connect-timeout',
  '--retry',
  '-x', '--proxy',
]);

export function tokenizeCurl(input: string): string[] {
  const text = input.replaceAll(/\\\r?\n/g, ' ').replaceAll(/\s*\^\r?\n\s*/g, ' ');
  const tokens: string[] = [];

  let current = '';
  let quote: '"' | "'" | null = null;
  let started = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quote === "'") {
      if (char === "'") quote = null;
      else current += char;
      continue;
    }

    if (quote === '"') {
      if (char === '\\' && i + 1 < text.length && '"\\$`'.includes(text[i + 1])) {
        current += text[i + 1];
        i += 1;
        continue;
      }
      if (char === '"') quote = null;
      else current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      started = true;
      continue;
    }

    if (char === '\\' && i + 1 < text.length) {
      current += text[i + 1];
      i += 1;
      started = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (current || started) tokens.push(current);
      current = '';
      started = false;
      continue;
    }

    current += char;
    started = true;
  }

  if (current || started) tokens.push(current);
  return tokens;
}

function splitHeader(value: string): [string, string] | null {
  const index = value.indexOf(':');
  if (index === -1) return null;

  const name = value.slice(0, index).trim();
  if (!name) return null;

  return [name, value.slice(index + 1).trim()];
}

function detectBodyKind(body: string, headers: Array<[string, string]>): CurlRequest['bodyKind'] {
  const contentType = headers.find(([name]) => name.toLowerCase() === 'content-type')?.[1] ?? '';

  if (/json/i.test(contentType)) return 'json';
  if (/x-www-form-urlencoded/i.test(contentType)) return 'form';

  const trimmed = body.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      return 'raw';
    }
  }

  if (/^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(trimmed)) return 'form';
  return 'raw';
}

export function parseCurl(command: string): CurlResult {
  const tokens = tokenizeCurl(command.trim());
  if (tokens.length === 0) return { ok: false, error: 'Enter a curl command.' };
  if (tokens[0] !== 'curl') return { ok: false, error: 'The command must start with "curl".' };

  const headers: Array<[string, string]> = [];
  const dataParts: string[] = [];
  const formParts: string[] = [];

  let url = '';
  let method = '';
  let auth: CurlRequest['auth'] = null;
  let insecure = false;
  let followRedirects = false;
  let getWithData = false;
  let headOnly = false;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (!token.startsWith('-')) {
      if (!url) url = token;
      continue;
    }

    const equals = token.indexOf('=');
    const isLongWithValue = token.startsWith('--') && equals !== -1;
    const flag = isLongWithValue ? token.slice(0, equals) : token;

    const readValue = (): string => {
      if (isLongWithValue) return token.slice(equals + 1);
      i += 1;
      return tokens[i] ?? '';
    };

    switch (flag) {
      case '-X':
      case '--request':
        method = readValue().toUpperCase();
        break;

      case '-H':
      case '--header': {
        const header = splitHeader(readValue());
        if (header) headers.push(header);
        break;
      }

      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-binary':
      case '--data-ascii':
        dataParts.push(readValue());
        break;

      case '--data-urlencode': {
        const raw = readValue();
        const index = raw.indexOf('=');
        dataParts.push(
          index === -1
            ? encodeURIComponent(raw)
            : `${raw.slice(0, index)}=${encodeURIComponent(raw.slice(index + 1))}`
        );
        break;
      }

      case '-F':
      case '--form':
        formParts.push(readValue());
        break;

      case '-u':
      case '--user': {
        const raw = readValue();
        const index = raw.indexOf(':');
        auth =
          index === -1
            ? { user: raw, password: '' }
            : { user: raw.slice(0, index), password: raw.slice(index + 1) };
        break;
      }

      case '-b':
      case '--cookie':
        headers.push(['Cookie', readValue()]);
        break;

      case '-A':
      case '--user-agent':
        headers.push(['User-Agent', readValue()]);
        break;

      case '-e':
      case '--referer':
        headers.push(['Referer', readValue()]);
        break;

      case '--url':
        url = readValue();
        break;

      case '-G':
      case '--get':
        getWithData = true;
        break;

      case '-I':
      case '--head':
        headOnly = true;
        break;

      case '-L':
      case '--location':
        followRedirects = true;
        break;

      case '-k':
      case '--insecure':
        insecure = true;
        break;

      default:
        if (FLAGS_WITH_VALUE.has(flag)) readValue();
        break;
    }
  }

  if (!url) return { ok: false, error: 'No URL found in the command.' };

  let body: string | null = null;

  if (formParts.length > 0) {
    body = formParts.join('\n');
  } else if (dataParts.length > 0) {
    body = dataParts.join('&');
  }

  if (getWithData && body) {
    url += (url.includes('?') ? '&' : '?') + body;
    body = null;
  }

  if (!method) {
    if (headOnly) method = 'HEAD';
    else if (body !== null) method = 'POST';
    else method = 'GET';
  }

  const bodyKind: CurlRequest['bodyKind'] =
    formParts.length > 0 ? 'form' : body === null ? 'none' : detectBodyKind(body, headers);

  return {
    ok: true,
    request: { method, url, headers, body, bodyKind, auth, insecure, followRedirects },
  };
}

function quoteJs(value: string): string {
  return JSON.stringify(value);
}

function prettyJson(body: string, indent: string): string | null {
  try {
    return JSON.stringify(JSON.parse(body), null, 2).split('\n').join(`\n${indent}`);
  } catch {
    return null;
  }
}

export function toFetch(request: CurlRequest): string {
  const lines: string[] = [];
  const headers = [...request.headers];

  if (request.auth) {
    const encoded = `btoa(${quoteJs(`${request.auth.user}:${request.auth.password}`)})`;
    headers.push(['Authorization', `__BASIC__${encoded}`]);
  }

  const options: string[] = [`  method: ${quoteJs(request.method)},`];

  if (headers.length > 0) {
    const entries = headers.map(([name, value]) =>
      value.startsWith('__BASIC__')
        ? `    ${quoteJs(name)}: "Basic " + ${value.slice(9)},`
        : `    ${quoteJs(name)}: ${quoteJs(value)},`
    );
    options.push(`  headers: {\n${entries.join('\n')}\n  },`);
  }

  if (request.body !== null) {
    if (request.bodyKind === 'json') {
      const pretty = prettyJson(request.body, '  ');
      options.push(pretty ? `  body: JSON.stringify(${pretty}),` : `  body: ${quoteJs(request.body)},`);
    } else {
      options.push(`  body: ${quoteJs(request.body)},`);
    }
  }

  if (!request.followRedirects) options.push('  redirect: "manual",');

  lines.push(`const response = await fetch(${quoteJs(request.url)}, {`);
  lines.push(...options);
  lines.push('});');
  lines.push('');
  lines.push('const data = await response.json();');

  if (request.insecure) {
    lines.unshift('// curl ran with --insecure. Browsers cannot skip certificate checks.');
  }

  return lines.join('\n');
}

function quotePython(value: string): string {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

export function toPythonRequests(request: CurlRequest): string {
  const lines = ['import requests', ''];
  const args: string[] = [`    ${quotePython(request.url)},`];

  if (request.headers.length > 0) {
    const entries = request.headers.map(
      ([name, value]) => `        ${quotePython(name)}: ${quotePython(value)},`
    );
    args.push(`    headers={\n${entries.join('\n')}\n    },`);
  }

  if (request.auth) {
    args.push(`    auth=(${quotePython(request.auth.user)}, ${quotePython(request.auth.password)}),`);
  }

  if (request.body !== null) {
    if (request.bodyKind === 'json') {
      const pretty = prettyJson(request.body, '    ');
      args.push(
        pretty
          ? `    json=${pretty.replaceAll(/\btrue\b/g, 'True').replaceAll(/\bfalse\b/g, 'False').replaceAll(/\bnull\b/g, 'None')},`
          : `    data=${quotePython(request.body)},`
      );
    } else {
      args.push(`    data=${quotePython(request.body)},`);
    }
  }

  if (request.insecure) args.push('    verify=False,');
  if (!request.followRedirects) args.push('    allow_redirects=False,');

  lines.push(`response = requests.${request.method.toLowerCase()}(`);
  lines.push(...args);
  lines.push(')');
  lines.push('');
  lines.push('print(response.json())');

  return lines.join('\n');
}
