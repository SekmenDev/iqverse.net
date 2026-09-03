export interface MarkdownStats {
  chars: number;
  characters: number;
  words: number;
  readTimeMinutes: number;
  readingTimeMinutes: number;
}

export function parseMarkdownToHtml(md: string): string {
  let html = md;
  html = html.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  // Fenced Code Blocks
  html = html.replaceAll(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline Code
  html = html.replaceAll(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replaceAll(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replaceAll(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replaceAll(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replaceAll(/^&gt;\s?(.*$)/gim, '<blockquote>$1</blockquote>');

  // Links [text](url)
  html = html.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold & Italic
  html = html.replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replaceAll(/\*([^*]+)\*/g, '<em>$1</em>');

  // Task lists & unordered lists
  html = html.replaceAll(/^-\s*\[x\]\s*(.*$)/gim, '<li style="list-style: none;">☑ $1</li>');
  html = html.replaceAll(/^-\s*\[\s*\]\s*(.*$)/gim, '<li style="list-style: none;">☐ $1</li>');
  html = html.replaceAll(/^-\s*(.*$)/gim, '<li>$1</li>');

  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replaceAll('\n', '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

export function calculateMarkdownStats(text: string): MarkdownStats {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    chars,
    characters: chars,
    words,
    readTimeMinutes,
    readingTimeMinutes: readTimeMinutes,
  };
}
