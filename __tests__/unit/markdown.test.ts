import { describe, it, expect } from 'vitest';
import { parseMarkdownToHtml, calculateMarkdownStats } from '@/lib/markdown';

describe('Markdown Engine (lib/markdown)', () => {
  it('converts markdown headers, bold, links, and code blocks to HTML', () => {
    const md = '# Title\n\nThis is **bold** and [Link](https://iqverse.net).\n\n```js\nconsole.log("hi");\n```';
    const html = parseMarkdownToHtml(md);

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<a href="https://iqverse.net">Link</a>');
    expect(html).toContain('<pre><code class="language-js">console.log("hi");</code></pre>');
  });

  it('calculates markdown document statistics', () => {
    const md = 'Hello world! This is a simple test document containing ten words total.';
    const stats = calculateMarkdownStats(md);

    expect(stats.words).toBe(12);
    expect(stats.characters).toBe(71);
    expect(stats.readingTimeMinutes).toBe(1);
  });
});
