export type Status = 'pass' | 'warn' | 'fail' | 'info';
export type AssessmentCategory = 'security' | 'performance' | 'info';

export interface HeaderAssessment {
  name: string;
  short: string;
  category: AssessmentCategory;
  description: string;
  recommendation?: string;
  status: Status;
  message: string;
}

export interface HeaderAnalysisResult {
  url: string;
  score: number;
  grade: string;
  assessments: HeaderAssessment[];
  rawHeaders: Record<string, string>;
}

export const HEADER_DEFINITIONS = [
  {
    name: 'Content-Security-Policy',
    short: 'CSP',
    category: 'security' as AssessmentCategory,
    description: 'Controls which resources the browser may load.',
    recommendation: "Add: Content-Security-Policy: default-src 'self'; script-src 'self';",
    check: (val: string) => {
      if (!val) return { status: 'fail' as Status, message: 'CSP is missing.' };
      if (/unsafe-inline/i.test(val)) return { status: 'warn' as Status, message: "'unsafe-inline' weakens CSP." };
      return { status: 'pass' as Status, message: 'CSP is configured.' };
    },
  },
  {
    name: 'Strict-Transport-Security',
    short: 'HSTS',
    category: 'security' as AssessmentCategory,
    description: 'Forces HTTPS for all future requests.',
    recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    check: (val: string) => {
      if (!val) return { status: 'fail' as Status, message: 'HSTS is not configured.' };
      return { status: 'pass' as Status, message: 'HSTS is configured.' };
    },
  },
  {
    name: 'X-Content-Type-Options',
    short: 'XCTO',
    category: 'security' as AssessmentCategory,
    description: 'Prevents MIME-sniffing.',
    recommendation: 'Add: X-Content-Type-Options: nosniff',
    check: (val: string) => {
      if (!val) return { status: 'fail' as Status, message: 'Missing header.' };
      return { status: 'pass' as Status, message: 'Correctly set to nosniff.' };
    },
  },
  {
    name: 'X-Frame-Options',
    short: 'XFO',
    category: 'security' as AssessmentCategory,
    description: 'Prevents clickjacking.',
    recommendation: 'Add: X-Frame-Options: DENY',
    check: (val: string) => {
      if (!val) return { status: 'warn' as Status, message: 'Consider setting DENY or SAMEORIGIN.' };
      return { status: 'pass' as Status, message: 'Clickjacking protection configured.' };
    },
  },
  {
    name: 'Referrer-Policy',
    short: 'Referrer',
    category: 'security' as AssessmentCategory,
    description: 'Controls referrer header information sent with requests.',
    recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
    check: (val: string) => {
      if (!val) return { status: 'warn' as Status, message: 'Referrer-Policy header is missing.' };
      return { status: 'pass' as Status, message: `Configured: ${val}` };
    },
  },
  {
    name: 'Permissions-Policy',
    short: 'Permissions',
    category: 'security' as AssessmentCategory,
    description: 'Restricts browser features like camera, microphone, geolocation.',
    recommendation: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()',
    check: (val: string) => {
      if (!val) return { status: 'warn' as Status, message: 'Permissions-Policy is missing.' };
      return { status: 'pass' as Status, message: 'Permissions policy active.' };
    },
  },
  {
    name: 'Cache-Control',
    short: 'Cache',
    category: 'performance' as AssessmentCategory,
    description: 'Defines caching behavior.',
    recommendation: 'Add: Cache-Control with appropriate max-age directives',
    check: (val: string) => {
      if (!val) return { status: 'warn' as Status, message: 'No Cache-Control header found.' };
      return { status: 'pass' as Status, message: `Configured: ${val}` };
    },
  },
  {
    name: 'Server',
    short: 'Server',
    category: 'info' as AssessmentCategory,
    description: 'Identifies web server software.',
    recommendation: 'Mask detailed version numbers to avoid information disclosure.',
    check: (val: string) => {
      if (!val) return { status: 'pass' as Status, message: 'Server header is hidden.' };
      return { status: 'info' as Status, message: `Server: ${val}` };
    },
  },
];

export async function analyzeHeaders(targetUrl: string): Promise<HeaderAnalysisResult> {
  const proxyUrl = `/api/check-url?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch headers: HTTP ${res.status}`);
  }

  const json = await res.json();
  const rawHeaders: Record<string, string> = json.headers || {};

  const assessments: HeaderAssessment[] = HEADER_DEFINITIONS.map((def) => {
    const val = rawHeaders[def.name.toLowerCase()] || rawHeaders[def.name] || '';
    const result = def.check(val);
    return {
      name: def.name,
      short: def.short,
      category: def.category,
      description: def.description,
      recommendation: def.recommendation,
      status: result.status,
      message: result.message,
    };
  });

  const secAssessments = assessments.filter((a) => a.category === 'security');
  const passCount = secAssessments.filter((a) => a.status === 'pass').length;
  const score = Math.round((passCount / Math.max(1, secAssessments.length)) * 100);

  let grade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';

  return {
    url: targetUrl,
    score,
    grade,
    assessments,
    rawHeaders,
  };
}
