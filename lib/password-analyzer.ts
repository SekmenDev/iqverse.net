export interface PasswordStats {
  entropy: number;
  charsetSize: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  rating: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  offlineCrackTime: string;
  onlineFastCrackTime: string;
  onlineSlowCrackTime: string;
}

export function calculatePasswordEntropy(pwd: string): {
  entropy: number;
  charsetSize: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
} {
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;

  if (pwd.length === 0 || charsetSize === 0) {
    return { entropy: 0, charsetSize: 0, hasLower, hasUpper, hasDigit, hasSymbol };
  }

  const entropy = Math.round(pwd.length * Math.log2(charsetSize) * 10) / 10;
  return { entropy, charsetSize, hasLower, hasUpper, hasDigit, hasSymbol };
}

export function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} minutes`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days} days`;
  const years = Math.round(days / 365);
  if (years < 1000) return `${years} years`;
  if (years < 1000000) return `${Math.round(years / 1000)} thousand years`;
  return `${Math.round(years / 1000000)} million years`;
}

export function analyzePassword(password: string): PasswordStats {
  const stats = calculatePasswordEntropy(password);
  const combinations = Math.pow(stats.charsetSize, password.length);

  const offlineSec = combinations / 1e11;
  const onlineFastSec = combinations / 1000;
  const onlineSlowSec = combinations / 10;

  let rating: PasswordStats['rating'] = 'Weak';
  let color = '#ff4d4f';

  if (stats.entropy >= 80) {
    rating = 'Very Strong';
    color = '#4caf50';
  } else if (stats.entropy >= 60) {
    rating = 'Strong';
    color = '#8bc34a';
  } else if (stats.entropy >= 40) {
    rating = 'Medium';
    color = '#faad14';
  } else if (stats.entropy >= 20) {
    rating = 'Weak';
    color = '#ff9800';
  } else {
    rating = 'Very Weak';
    color = '#ff4d4f';
  }

  return {
    ...stats,
    rating,
    color,
    offlineCrackTime: formatCrackTime(offlineSec),
    onlineFastCrackTime: formatCrackTime(onlineFastSec),
    onlineSlowCrackTime: formatCrackTime(onlineSlowSec),
  };
}

export function analyzePasswordStrength(password: string): PasswordStats & {
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
  entropy: number;
  crackTime: string;
  crackTimeOffline: string;
  crackTimeOnlineFast: string;
  crackTimeOnlineSlow: string;
  feedback: string[];
} {
  const stats = analyzePassword(password);
  let strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong' = 'weak';
  const score = Math.min(100, Math.round(stats.entropy));

  if (stats.rating === 'Very Strong') strength = 'very_strong';
  else if (stats.rating === 'Strong') strength = 'strong';
  else if (stats.rating === 'Medium') strength = 'medium';
  else if (stats.rating === 'Weak') strength = 'weak';
  else strength = 'very_weak';

  const feedback: string[] = [];
  if (password.length < 8) feedback.push('Length should be at least 8 characters');
  if (!stats.hasUpper) feedback.push('Add uppercase letters');
  if (!stats.hasSymbol) feedback.push('Add special symbols');

  return {
    ...stats,
    strength,
    score,
    entropy: stats.entropy,
    crackTime: stats.offlineCrackTime,
    crackTimeOffline: stats.offlineCrackTime,
    crackTimeOnlineFast: stats.onlineFastCrackTime,
    crackTimeOnlineSlow: stats.onlineSlowCrackTime,
    feedback,
  };
}
