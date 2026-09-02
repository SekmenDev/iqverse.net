export type PrimitiveName = 'string' | 'number' | 'boolean' | 'null' | 'unknown';

export type TypeNode =
  | { kind: 'primitive'; name: PrimitiveName }
  | { kind: 'array'; element: TypeNode }
  | { kind: 'object'; fields: Record<string, { type: TypeNode; optional: boolean }> }
  | { kind: 'union'; options: TypeNode[] };

export interface GenerateOptions {
  rootName: string;
  declaration: 'interface' | 'type';
  nullAsOptional: boolean;
  readonlyProps: boolean;
  exportTypes: boolean;
}

export type GenerateResult = { ok: true; code: string } | { ok: false; error: string };

export const DEFAULT_OPTIONS: GenerateOptions = {
  rootName: 'Root',
  declaration: 'interface',
  nullAsOptional: false,
  readonlyProps: false,
  exportTypes: true,
};

const RESERVED = new Set(['default', 'function', 'class', 'interface', 'enum', 'const', 'import', 'export']);

export function pascalCase(input: string): string {
  const cleaned = input
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+|(?<=[a-z0-9])(?=[A-Z])/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (!cleaned) return 'Item';
  return /^\d/.test(cleaned) ? `N${cleaned}` : cleaned;
}

export function singularize(name: string): string {
  if (/ies$/i.test(name) && name.length > 4) return `${name.slice(0, -3)}y`;
  if (/(ss|us|is)$/i.test(name)) return name;
  if (/s$/i.test(name) && name.length > 2) return name.slice(0, -1);
  return name;
}

function primitive(name: PrimitiveName): TypeNode {
  return { kind: 'primitive', name };
}

function inferNode(value: unknown): TypeNode {
  if (value === null) return primitive('null');

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', element: primitive('unknown') };
    return { kind: 'array', element: value.map(inferNode).reduce(mergeNodes) };
  }

  switch (typeof value) {
    case 'string':
      return primitive('string');
    case 'number':
      return primitive('number');
    case 'boolean':
      return primitive('boolean');
    case 'object': {
      const fields: Record<string, { type: TypeNode; optional: boolean }> = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        fields[key] = { type: inferNode(item), optional: false };
      }
      return { kind: 'object', fields };
    }
    default:
      return primitive('unknown');
  }
}

function signature(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      return node.name;
    case 'array':
      return `Array<${signature(node.element)}>`;
    case 'union':
      return node.options.map(signature).sort().join('|');
    case 'object':
      return `{${Object.keys(node.fields)
        .sort()
        .map(key => `${key}${node.fields[key].optional ? '?' : ''}:${signature(node.fields[key].type)}`)
        .join(',')}}`;
  }
}

function flatten(node: TypeNode): TypeNode[] {
  return node.kind === 'union' ? node.options : [node];
}

export function mergeNodes(a: TypeNode, b: TypeNode): TypeNode {
  if (signature(a) === signature(b)) return a;

  if (a.kind === 'object' && b.kind === 'object') {
    const keys = new Set([...Object.keys(a.fields), ...Object.keys(b.fields)]);
    const fields: Record<string, { type: TypeNode; optional: boolean }> = {};

    for (const key of keys) {
      const left = a.fields[key];
      const right = b.fields[key];

      if (left && right) {
        fields[key] = {
          type: mergeNodes(left.type, right.type),
          optional: left.optional || right.optional,
        };
      } else {
        const present = left ?? right;
        fields[key] = { type: present.type, optional: true };
      }
    }

    return { kind: 'object', fields };
  }

  if (a.kind === 'array' && b.kind === 'array') {
    return { kind: 'array', element: mergeNodes(a.element, b.element) };
  }

  const options: TypeNode[] = [];
  const seen = new Set<string>();

  for (const option of [...flatten(a), ...flatten(b)]) {
    const key = signature(option);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(option);
  }

  return options.length === 1 ? options[0] : { kind: 'union', options };
}

interface Declaration {
  name: string;
  fields: Array<{ key: string; type: string; optional: boolean }>;
}

function propertyKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) && !RESERVED.has(key) ? key : JSON.stringify(key);
}

function collect(node: TypeNode, preferredName: string, state: {
  declarations: Declaration[];
  bySignature: Map<string, string>;
  usedNames: Set<string>;
  options: GenerateOptions;
}): string {
  switch (node.kind) {
    case 'primitive':
      return node.name;

    case 'array':
      return `${wrapUnion(collect(node.element, singularize(preferredName), state))}[]`;

    case 'union':
      return node.options.map(option => collect(option, preferredName, state)).join(' | ');

    case 'object': {
      const key = signature(node);
      const existing = state.bySignature.get(key);
      if (existing) return existing;

      let name = pascalCase(preferredName);
      let suffix = 2;
      while (state.usedNames.has(name)) {
        name = `${pascalCase(preferredName)}${suffix}`;
        suffix += 1;
      }

      state.usedNames.add(name);
      state.bySignature.set(key, name);

      const declaration: Declaration = { name, fields: [] };
      state.declarations.push(declaration);

      for (const [fieldKey, field] of Object.entries(node.fields)) {
        let type = field.type;
        let optional = field.optional;

        if (state.options.nullAsOptional) {
          const options = flatten(type).filter(
            option => !(option.kind === 'primitive' && option.name === 'null')
          );

          if (options.length !== flatten(type).length) {
            optional = true;
            type = options.length === 0
              ? primitive('unknown')
              : options.length === 1
                ? options[0]
                : { kind: 'union', options };
          }
        }

        declaration.fields.push({
          key: fieldKey,
          type: collect(type, fieldKey, state),
          optional,
        });
      }

      return name;
    }
  }
}

function wrapUnion(rendered: string): string {
  return rendered.includes(' | ') ? `(${rendered})` : rendered;
}

function render(declarations: Declaration[], options: GenerateOptions): string {
  const prefix = options.exportTypes ? 'export ' : '';
  const readonly = options.readonlyProps ? 'readonly ' : '';

  return declarations
    .map(declaration => {
      const body = declaration.fields
        .map(
          field =>
            `  ${readonly}${propertyKey(field.key)}${field.optional ? '?' : ''}: ${field.type};`
        )
        .join('\n');

      const inner = body || '  [key: string]: unknown;';

      return options.declaration === 'type'
        ? `${prefix}type ${declaration.name} = {\n${inner}\n};`
        : `${prefix}interface ${declaration.name} {\n${inner}\n}`;
    })
    .join('\n\n');
}

export function generateTypes(
  jsonText: string,
  overrides: Partial<GenerateOptions> = {}
): GenerateResult {
  const options: GenerateOptions = { ...DEFAULT_OPTIONS, ...overrides };
  const trimmed = jsonText.trim();

  if (!trimmed) return { ok: false, error: 'Paste some JSON to convert.' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON.' };
  }

  const rootName = pascalCase(options.rootName || 'Root');
  const node = inferNode(parsed);

  const state = {
    declarations: [] as Declaration[],
    bySignature: new Map<string, string>(),
    usedNames: new Set<string>(),
    options,
  };

  const rootType = collect(node, rootName, state);

  if (state.declarations.length === 0) {
    const prefix = options.exportTypes ? 'export ' : '';
    return { ok: true, code: `${prefix}type ${rootName} = ${rootType};` };
  }

  const code = render(state.declarations, options);

  // A root array needs an alias, since collect names the element type instead
  if (node.kind === 'array') {
    const prefix = options.exportTypes ? 'export ' : '';
    return { ok: true, code: `${code}\n\n${prefix}type ${rootName}List = ${rootType};` };
  }

  return { ok: true, code };
}
