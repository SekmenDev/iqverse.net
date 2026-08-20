export interface MarkdownStats {
  chars: number;
  characters: number;
  words: number;
  readTimeMinutes: number;
  readingTimeMinutes: number;
}

export function parseMarkdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Fenced Code Blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote>$1</blockquote>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Task lists & unordered lists
  html = html.replace(/^-\s*\[x\]\s*(.*$)/gim, '<li style="list-style: none;">☑ $1</li>');
  html = html.replace(/^-\s*\[\s*\]\s*(.*$)/gim, '<li style="list-style: none;">☐ $1</li>');
  html = html.replace(/^-\s*(.*$)/gim, '<li>$1</li>');

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
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
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
