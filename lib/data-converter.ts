export function objectToYaml(obj: unknown, indentLevel: number = 0): string {
  const indent = '  '.repeat(indentLevel);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj || '""';
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const subYaml = objectToYaml(item, indentLevel + 1).trimStart();
          return `${indent}- ${subYaml}`;
        }
        return `${indent}- ${objectToYaml(item, indentLevel)}`;
      })
      .join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) return '{}';
    return keys
      .map((key) => {
        const val = (obj as Record<string, unknown>)[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return `${indent}${key}:\n${objectToYaml(val, indentLevel + 1)}`;
        }
        if (Array.isArray(val)) {
          return `${indent}${key}:\n${objectToYaml(val, indentLevel + 1)}`;
        }
        return `${indent}${key}: ${objectToYaml(val, indentLevel)}`;
      })
      .join('\n');
  }

  return String(obj);
}

export function yamlToObject(yamlStr: string): unknown {
  const lines = yamlStr.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  const root: Record<string, unknown> = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let valStr = trimmed.slice(colonIdx + 1).trim();
      if (valStr.startsWith('"') && valStr.endsWith('"')) {
        valStr = valStr.slice(1, -1);
      }
      let val: unknown = valStr;
      if (valStr === 'true') val = true;
      else if (valStr === 'false') val = false;
      else if (valStr === 'null') val = null;
      else if (!isNaN(Number(valStr)) && valStr !== '') val = Number(valStr);

      root[key] = val;
    }
  });

  return Object.keys(root).length > 0 ? root : JSON.parse(yamlStr);
}

export function objectToToml(obj: Record<string, unknown>): string {
  let toml = '';
  const primitives: string[] = [];
  const tables: string[] = [];

  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      tables.push(`[${key}]\n${objectToToml(val as Record<string, unknown>)}`);
    } else if (typeof val === 'string') {
      primitives.push(`${key} = "${val}"`);
    } else if (typeof val === 'boolean' || typeof val === 'number') {
      primitives.push(`${key} = ${val}`);
    } else if (Array.isArray(val)) {
      primitives.push(`${key} = ${JSON.stringify(val)}`);
    }
  });

  toml = primitives.join('\n');
  if (tables.length > 0) {
    if (toml) toml += '\n\n';
    toml += tables.join('\n\n');
  }

  return toml;
}

export type DataFormat = 'json' | 'yaml' | 'toml';

export interface DataConversionResult {
  success: boolean;
  output: string;
  error?: string;
  toString(): string;
}

export function tomlToObject(tomlStr: string): Record<string, unknown> {
  const lines = tomlStr.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  const root: Record<string, unknown> = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let valStr = trimmed.slice(eqIdx + 1).trim();
      if (valStr.startsWith('"') && valStr.endsWith('"')) {
        valStr = valStr.slice(1, -1);
      }
      let val: unknown = valStr;
      if (valStr === 'true') val = true;
      else if (valStr === 'false') val = false;
      else if (!isNaN(Number(valStr)) && valStr !== '') val = Number(valStr);

      root[key] = val;
    }
  });

  return root;
}

export function convertDataFormat(
  input: string,
  sourceFormat: DataFormat,
  targetFormat: DataFormat
): DataConversionResult {
  try {
    let parsedObj: unknown = null;
    if (sourceFormat === 'json') {
      parsedObj = JSON.parse(input);
    } else if (sourceFormat === 'yaml') {
      parsedObj = yamlToObject(input);
    } else if (sourceFormat === 'toml') {
      parsedObj = tomlToObject(input);
    }

    let output = '';
    if (targetFormat === 'json') {
      output = JSON.stringify(parsedObj, null, 2);
    } else if (targetFormat === 'yaml') {
      output = objectToYaml(parsedObj);
    } else if (targetFormat === 'toml') {
      if (typeof parsedObj !== 'object' || parsedObj === null || Array.isArray(parsedObj)) {
        throw new TypeError('TOML root must be an object/table.');
      }
      output = objectToToml(parsedObj as Record<string, unknown>);
    }

    return {
      success: true,
      output,
      toString() {
        return this.output;
      },
    };
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: err.message || 'Conversion failed.',
      toString() {
        return '';
      },
    };
  }
}
