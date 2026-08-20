export interface LlmsLinkItem {
  title: string;
  url: string;
  desc?: string;
}

export interface LlmsSection {
  title: string;
  links: LlmsLinkItem[];
}

export interface LlmsTxtData {
  title: string;
  summary?: string;
  details?: string;
  sections: LlmsSection[];
  optionalLinks?: LlmsLinkItem[];
}

export interface LlmsValidationResult {
  isValid: boolean;
  valid: boolean;
  linksCount: number;
  errors: string[];
  warnings: string[];
}

export function generateLlmsTxt(data: LlmsTxtData): string {
  let md = `# ${data.title.trim()}\n\n`;
  if (data.summary?.trim()) {
    md += `> ${data.summary.trim()}\n\n`;
  }
  if (data.details?.trim()) {
    md += `${data.details.trim()}\n\n`;
  }

  data.sections.forEach((sec) => {
    if (sec.title.trim()) {
      md += `## ${sec.title.trim()}\n\n`;
    }
    sec.links.forEach((l) => {
      if (l.title.trim() && l.url.trim()) {
        md += `- [${l.title.trim()}](${l.url.trim()})${l.desc?.trim() ? `: ${l.desc.trim()}` : ''}\n`;
      }
    });
    md += '\n';
  });

  if (data.optionalLinks && data.optionalLinks.length > 0) {
    md += `## Optional\n\n`;
    data.optionalLinks.forEach((l) => {
      if (l.title.trim() && l.url.trim()) {
        md += `- [${l.title.trim()}](${l.url.trim()})${l.desc?.trim() ? `: ${l.desc.trim()}` : ''}\n`;
      }
    });
    md += '\n';
  }

  return md.trim();
}

export function validateLlmsTxt(text: string): LlmsValidationResult {
  const clean = text.trim();
  if (!clean) {
    return {
      isValid: false,
      valid: false,
      linksCount: 0,
      errors: ['Content is empty.'],
      warnings: [],
    };
  }

  const hasH1 = /^#\s+.+/m.test(clean);
  const hasSummary = /^>\s+.+/m.test(clean);
  const links = clean.match(/- \[[^\]]+\]\([^)]+\)/g) || [];

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!hasH1) errors.push('Missing H1 heading (# Title).');
  if (!hasSummary) warnings.push('Missing recommended blockquote summary (> Summary).');
  if (links.length === 0) warnings.push('No standard markdown bullet links found (- [Title](url)).');

  const valid = errors.length === 0;

  return {
    isValid: valid,
    valid,
    linksCount: links.length,
    errors,
    warnings,
  };
}
