export interface CaseItem {
  label: string;
  value: string;
}

export function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function convertCases(input: string): CaseItem[] {
  const words = toWords(input);

  const camelCase = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
  const pascalCase = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const snakeCase = words.map((w) => w.toLowerCase()).join('_');
  const kebabCase = words.map((w) => w.toLowerCase()).join('-');
  const constantCase = words.map((w) => w.toUpperCase()).join('_');
  const titleCase = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const uppercase = input.toUpperCase();
  const lowercase = input.toLowerCase();
  const dotCase = words.map((w) => w.toLowerCase()).join('.');
  const alternatingCase = input
    .split('')
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join('');

  return [
    { label: 'camelCase', value: camelCase },
    { label: 'PascalCase', value: pascalCase },
    { label: 'snake_case', value: snakeCase },
    { label: 'kebab-case', value: kebabCase },
    { label: 'CONSTANT_CASE', value: constantCase },
    { label: 'Title Case', value: titleCase },
    { label: 'UPPERCASE', value: uppercase },
    { label: 'lowercase', value: lowercase },
    { label: 'dot.case', value: dotCase },
    { label: 'aLtErNaTiNg cAsE', value: alternatingCase },
  ];
}

export interface ConvertedCases {
  camel: string;
  pascal: string;
  snake: string;
  kebab: string;
  constant: string;
  title: string;
  dot: string;
  upper: string;
  lower: string;
}

export function convertAllCases(input: string): ConvertedCases {
  const items = convertCases(input);
  const map: Record<string, string> = {};
  items.forEach((it) => {
    map[it.label] = it.value;
  });

  return {
    camel: map['camelCase'] || '',
    pascal: map['PascalCase'] || '',
    snake: map['snake_case'] || '',
    kebab: map['kebab-case'] || '',
    constant: map['CONSTANT_CASE'] || '',
    title: map['Title Case'] || '',
    dot: map['dot.case'] || '',
    upper: map['UPPERCASE'] || '',
    lower: map['lowercase'] || '',
  };
}
