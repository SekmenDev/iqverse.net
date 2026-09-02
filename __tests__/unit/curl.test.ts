import { describe, it, expect } from 'vitest';
import { parseCurl, toFetch, toPythonRequests, tokenizeCurl, type CurlRequest } from '@/lib/curl';

function request(command: string): CurlRequest {
  const result = parseCurl(command);
  if (!result.ok) throw new Error(result.error);
  return result.request;
}

describe('curl converter (lib/curl) - tokenizeCurl', () => {
  it('splits on whitespace', () => {
    expect(tokenizeCurl('curl -X GET https://a.com')).toEqual(['curl', '-X', 'GET', 'https://a.com']);
  });

  it('keeps quoted strings together', () => {
    expect(tokenizeCurl(`curl -H 'Accept: application/json' https://a.com`)).toEqual([
      'curl',
      '-H',
      'Accept: application/json',
      'https://a.com',
    ]);
  });

  it('joins backslash line continuations', () => {
    const command = 'curl https://a.com \\\n  -H "A: b"';
    expect(tokenizeCurl(command)).toEqual(['curl', 'https://a.com', '-H', 'A: b']);
  });

  it('unescapes quotes inside double-quoted strings', () => {
    expect(tokenizeCurl(`curl -d "{\\"a\\": 1}" https://a.com`)).toContain('{"a": 1}');
  });

  it('treats single quotes as literal', () => {
    expect(tokenizeCurl(`curl -d '{"a": "b\\c"}' https://a.com`)).toContain('{"a": "b\\c"}');
  });

  it('preserves an intentionally empty argument', () => {
    expect(tokenizeCurl(`curl -d '' https://a.com`)).toEqual(['curl', '-d', '', 'https://a.com']);
  });
});

describe('curl converter (lib/curl) - parseCurl', () => {
  it('defaults to GET', () => {
    const parsed = request('curl https://api.example.com/users');
    expect(parsed.method).toBe('GET');
    expect(parsed.url).toBe('https://api.example.com/users');
    expect(parsed.body).toBeNull();
  });

  it('infers POST when a body is present', () => {
    expect(request('curl -d "a=1" https://a.com').method).toBe('POST');
  });

  it('respects an explicit method', () => {
    expect(request('curl -X DELETE https://a.com').method).toBe('DELETE');
    expect(request('curl --request patch https://a.com').method).toBe('PATCH');
  });

  it('collects headers', () => {
    const parsed = request(
      `curl -H 'Accept: application/json' -H 'X-Key: abc' https://a.com`
    );
    expect(parsed.headers).toEqual([
      ['Accept', 'application/json'],
      ['X-Key', 'abc'],
    ]);
  });

  it('ignores a header with no colon', () => {
    expect(request('curl -H "malformed" https://a.com').headers).toEqual([]);
  });

  it('joins repeated data flags with an ampersand', () => {
    expect(request('curl -d "a=1" -d "b=2" https://a.com').body).toBe('a=1&b=2');
  });

  it('percent-encodes --data-urlencode values', () => {
    expect(request('curl --data-urlencode "q=hello world" https://a.com').body).toBe('q=hello%20world');
  });

  it('moves the body into the query string for -G', () => {
    const parsed = request('curl -G -d "a=1&b=2" https://a.com/search');
    expect(parsed.url).toBe('https://a.com/search?a=1&b=2');
    expect(parsed.body).toBeNull();
    expect(parsed.method).toBe('GET');
  });

  it('appends with & when the URL already has a query string', () => {
    expect(request('curl -G -d "b=2" "https://a.com?a=1"').url).toBe('https://a.com?a=1&b=2');
  });

  it('reads basic auth credentials', () => {
    expect(request('curl -u alice:s3cret https://a.com').auth).toEqual({
      user: 'alice',
      password: 's3cret',
    });
    expect(request('curl -u alice https://a.com').auth).toEqual({ user: 'alice', password: '' });
  });

  it('maps shorthand flags to headers', () => {
    const parsed = request('curl -A "MyAgent/1.0" -e "https://ref.com" -b "k=v" https://a.com');
    expect(parsed.headers).toEqual([
      ['User-Agent', 'MyAgent/1.0'],
      ['Referer', 'https://ref.com'],
      ['Cookie', 'k=v'],
    ]);
  });

  it('reads --long=value syntax', () => {
    expect(request('curl --request=PUT --url=https://a.com').method).toBe('PUT');
    expect(request('curl --request=PUT --url=https://a.com').url).toBe('https://a.com');
  });

  it('tracks -L, -k and -I', () => {
    const parsed = request('curl -L -k -I https://a.com');
    expect(parsed.followRedirects).toBe(true);
    expect(parsed.insecure).toBe(true);
    expect(parsed.method).toBe('HEAD');
  });

  it('skips unknown flags and their values', () => {
    const parsed = request('curl --max-time 30 -o out.txt https://a.com');
    expect(parsed.url).toBe('https://a.com');
  });

  it('classifies the body kind', () => {
    expect(request(`curl -d '{"a":1}' https://a.com`).bodyKind).toBe('json');
    expect(request('curl -d "a=1&b=2" https://a.com').bodyKind).toBe('form');
    expect(request('curl -d "just text" https://a.com').bodyKind).toBe('raw');
    expect(request('curl https://a.com').bodyKind).toBe('none');
  });

  it('trusts an explicit JSON content type over the body shape', () => {
    const parsed = request(`curl -H "Content-Type: application/json" -d 'not json' https://a.com`);
    expect(parsed.bodyKind).toBe('json');
  });

  it('reports errors instead of throwing', () => {
    expect(parseCurl('')).toEqual({ ok: false, error: 'Enter a curl command.' });
    expect(parseCurl('wget https://a.com').ok).toBe(false);
    expect(parseCurl('curl -X POST').ok).toBe(false);
  });
});

describe('curl converter (lib/curl) - toFetch', () => {
  it('renders a simple GET', () => {
    const code = toFetch(request('curl -L https://a.com'));
    expect(code).toContain('await fetch("https://a.com"');
    expect(code).toContain('method: "GET"');
    expect(code).not.toContain('body:');
  });

  it('renders headers as an object', () => {
    const code = toFetch(request(`curl -H 'Accept: application/json' https://a.com`));
    expect(code).toContain('"Accept": "application/json"');
  });

  it('pretty-prints a JSON body inside JSON.stringify', () => {
    const code = toFetch(request(`curl -d '{"name":"alice","age":30}' https://a.com`));
    expect(code).toContain('body: JSON.stringify({');
    expect(code).toContain('"name": "alice"');
  });

  it('keeps a non-JSON body as a quoted string', () => {
    expect(toFetch(request('curl -d "a=1&b=2" https://a.com'))).toContain('body: "a=1&b=2"');
  });

  it('builds a Basic auth header', () => {
    const code = toFetch(request('curl -u alice:s3cret https://a.com'));
    expect(code).toContain('"Authorization": "Basic " + btoa("alice:s3cret")');
  });

  it('sets redirect manual when curl was not given -L', () => {
    expect(toFetch(request('curl https://a.com'))).toContain('redirect: "manual"');
    expect(toFetch(request('curl -L https://a.com'))).not.toContain('redirect: "manual"');
  });

  it('notes that browsers cannot honour --insecure', () => {
    expect(toFetch(request('curl -k https://a.com'))).toContain('Browsers cannot skip certificate checks');
  });

  it('escapes quotes in the URL', () => {
    const code = toFetch(request(`curl 'https://a.com/"weird"'`));
    expect(code).toContain('\\"weird\\"');
  });
});

describe('curl converter (lib/curl) - toPythonRequests', () => {
  it('renders the matching requests call', () => {
    const code = toPythonRequests(request('curl -L https://a.com'));
    expect(code).toContain('import requests');
    expect(code).toContain('requests.get(');
    expect(code).toContain('"https://a.com"');
  });

  it('passes a JSON body through the json parameter with Python literals', () => {
    const code = toPythonRequests(request(`curl -d '{"ok":true,"missing":null}' https://a.com`));
    expect(code).toContain('json={');
    expect(code).toContain('True');
    expect(code).toContain('None');
    expect(code).not.toContain('true');
  });

  it('passes a form body through data', () => {
    expect(toPythonRequests(request('curl -d "a=1" https://a.com'))).toContain('data="a=1"');
  });

  it('maps auth, insecure and redirect flags', () => {
    const code = toPythonRequests(request('curl -u a:b -k https://a.com'));
    expect(code).toContain('auth=("a", "b")');
    expect(code).toContain('verify=False');
    expect(code).toContain('allow_redirects=False');
  });
});
