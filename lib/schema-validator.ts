export interface SchemaValidationResult {
  valid: boolean;
  types: string[];
  context: string | null;
  properties: string[];
  errors: string[];
  warnings: string[];
  itemCount: number;
  parsed: any;
}

export interface ExtractedSchemaItem {
  index: number;
  type: string;
  rawJson: string;
  parsed: any;
  validation: SchemaValidationResult;
}

/**
 * Common Schema.org type definitions with recommended properties for linting
 */
const TYPE_RECOMMENDATIONS: Record<string, { recommended: string[]; description: string }> = {
  Article: {
    recommended: ['headline', 'image', 'datePublished', 'author'],
    description: 'News, blog posts and informational articles',
  },
  NewsArticle: {
    recommended: ['headline', 'image', 'datePublished', 'dateModified', 'author', 'publisher'],
    description: 'News stories and journalistic reports',
  },
  BlogPosting: {
    recommended: ['headline', 'image', 'datePublished', 'author'],
    description: 'Blog posts and editorial essays',
  },
  Product: {
    recommended: ['name', 'image', 'description', 'offers'],
    description: 'Physical or digital goods and items for sale',
  },
  Organization: {
    recommended: ['name', 'url', 'logo'],
    description: 'Companies, non-profits or institutions',
  },
  LocalBusiness: {
    recommended: ['name', 'address', 'telephone', 'image'],
    description: 'Brick-and-mortar stores, restaurants or local services',
  },
  WebSite: {
    recommended: ['name', 'url'],
    description: 'Website metadata with optional SearchAction',
  },
  BreadcrumbList: {
    recommended: ['itemListElement'],
    description: 'Navigation breadcrumb trail hierarchy',
  },
  FAQPage: {
    recommended: ['mainEntity'],
    description: 'Frequently Asked Questions page with Q&A pairs',
  },
  Recipe: {
    recommended: ['name', 'image', 'recipeIngredient', 'recipeInstructions'],
    description: 'Culinary recipes and cooking guides',
  },
  Event: {
    recommended: ['name', 'startDate', 'location'],
    description: 'Scheduled public or private events',
  },
  JobPosting: {
    recommended: ['title', 'description', 'datePosted', 'hiringOrganization', 'jobLocation'],
    description: 'Employment and job vacancies',
  },
  Person: {
    recommended: ['name'],
    description: 'Individual person or contributor profile',
  },
  SoftwareSourceCode: {
    recommended: ['name', 'codeRepository', 'programmingLanguage'],
    description: 'Open-source or proprietary code repositories',
  },
  WebApplication: {
    recommended: ['name', 'applicationCategory', 'operatingSystem'],
    description: 'Online software tools and web apps',
  },
};

/**
 * Unescapes common HTML entities inside extracted script tags
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Cleans CDATA and comment wrappers from JSON-LD strings
 */
export function cleanJsonLdString(raw: string): string {
  let cleaned = raw.trim();

  // Strip script tags if present
  const scriptMatch = cleaned.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    cleaned = scriptMatch[1].trim();
  }

  // Strip CDATA wrappers (/* <![CDATA[ */ ... /* ]]> */ or // <![CDATA[)
  cleaned = cleaned
    .replace(/\/\*\s*<!\[CDATA\[\s*\*\/|\/\*\s*\]\]>\s*\*\//g, '')
    .replace(/\/\/\s*<!\[CDATA\[|\/\/\s*\]\]>/g, '')
    .trim();

  return decodeHtmlEntities(cleaned);
}

/**
 * Extracts all JSON-LD script blocks from an HTML string
 */
export function extractJsonLdFromHtml(html: string): string[] {
  if (!html || typeof html !== 'string') return [];

  const results: string[] = [];
  const scriptRegex = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    const rawContent = match[1];
    const cleaned = cleanJsonLdString(rawContent);
    if (cleaned.length > 0) {
      results.push(cleaned);
    }
  }

  return results;
}

/**
 * Validates a single schema object item
 */
function validateSchemaObject(
  obj: Record<string, any>,
  errors: string[],
  warnings: string[],
  types: Set<string>,
  properties: Set<string>
) {
  Object.keys(obj).forEach((k) => properties.add(k));

  const context = obj['@context'];
  const type = obj['@type'];

  if (!context) {
    errors.push("Missing required '@context' property (expected 'https://schema.org').");
  } else {
    const ctxStr = String(context).toLowerCase();
    if (!ctxStr.includes('schema.org')) {
      warnings.push(`Unusual @context value '${context}'. Expected 'https://schema.org'.`);
    } else if (ctxStr.startsWith('http:')) {
      warnings.push("Insecure @context 'http://schema.org'. Recommendation: use 'https://schema.org'.");
    }
  }

  if (!type) {
    errors.push("Missing required '@type' property (e.g. 'Article', 'Product', 'Organization').");
  } else {
    const typeList = Array.isArray(type) ? type : [type];
    typeList.forEach((t) => {
      const typeStr = String(t).trim();
      types.add(typeStr);

      const spec = TYPE_RECOMMENDATIONS[typeStr];
      if (spec) {
        spec.recommended.forEach((recProp) => {
          if (obj[recProp] === undefined || obj[recProp] === null || obj[recProp] === '') {
            warnings.push(
              `Recommended property '${recProp}' is missing for Schema type '${typeStr}'.`
            );
          }
        });
      }
    });
  }

  // Type specific validation rules
  if (obj['@type'] === 'FAQPage' && obj.mainEntity) {
    if (!Array.isArray(obj.mainEntity) || obj.mainEntity.length === 0) {
      warnings.push("FAQPage 'mainEntity' should be an array of Question objects.");
    }
  }

  if (obj['@type'] === 'BreadcrumbList' && obj.itemListElement) {
    if (!Array.isArray(obj.itemListElement) || obj.itemListElement.length === 0) {
      warnings.push("BreadcrumbList 'itemListElement' should be an array of ListItem objects.");
    }
  }

  if (obj.datePublished && Number.isNaN(Date.parse(obj.datePublished))) {
    warnings.push(`Invalid date format for 'datePublished': '${obj.datePublished}'. Use ISO-8601 (e.g. YYYY-MM-DD).`);
  }

  if (obj.dateModified && Number.isNaN(Date.parse(obj.dateModified))) {
    warnings.push(`Invalid date format for 'dateModified': '${obj.dateModified}'. Use ISO-8601 (e.g. YYYY-MM-DD).`);
  }
}

/**
 * Validates a JSON-LD payload (raw string or JS object)
 */
export function validateSchema(raw: string | object): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const types = new Set<string>();
  const properties = new Set<string>();
  let parsed: any = null;
  let context: string | null = null;
  let itemCount = 0;

  if (typeof raw === 'string') {
    const cleaned = cleanJsonLdString(raw);
    if (!cleaned) {
      return {
        valid: false,
        types: [],
        context: null,
        properties: [],
        errors: ['Input is empty. Please enter JSON-LD structured data.'],
        warnings: [],
        itemCount: 0,
        parsed: null,
      };
    }

    try {
      parsed = JSON.parse(cleaned);
    } catch (err: any) {
      return {
        valid: false,
        types: [],
        context: null,
        properties: [],
        errors: [`JSON Syntax Error: ${err?.message || 'Invalid JSON format'}`],
        warnings: [],
        itemCount: 0,
        parsed: null,
      };
    }
  } else {
    parsed = raw;
  }

  if (!parsed || typeof parsed !== 'object') {
    errors.push('Schema root must be a valid JSON object or array.');
    return {
      valid: false,
      types: [],
      context: null,
      properties: [],
      errors,
      warnings: [],
      itemCount: 0,
      parsed,
    };
  }

  // Handle array of schemas
  if (Array.isArray(parsed)) {
    itemCount = parsed.length;
    if (parsed.length === 0) {
      errors.push('JSON array is empty.');
    } else {
      parsed.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          if (!context && item['@context']) context = item['@context'];
          validateSchemaObject(item, errors, warnings, types, properties);
        } else {
          errors.push(`Array item at index ${idx} is not a valid object.`);
        }
      });
    }
  } else {
    // Top level object
    context = parsed['@context'] || null;

    // Handle @graph container
    if (Array.isArray(parsed['@graph'])) {
      itemCount = parsed['@graph'].length;
      if (parsed['@graph'].length === 0) {
        warnings.push("'@graph' array is empty.");
      } else {
        parsed['@graph'].forEach((item: any, idx: number) => {
          if (typeof item === 'object' && item !== null) {
            // If sub-item doesn't have @context, inherit from top-level
            const effectiveItem = {
              '@context': item['@context'] || context || 'https://schema.org',
              ...item,
            };
            validateSchemaObject(effectiveItem, errors, warnings, types, properties);
          } else {
            errors.push(`@graph item at index ${idx} is not a valid object.`);
          }
        });
      }
    } else {
      itemCount = 1;
      validateSchemaObject(parsed, errors, warnings, types, properties);
    }
  }

  // Deduplicate errors and warnings
  const uniqueErrors = Array.from(new Set(errors));
  const uniqueWarnings = Array.from(new Set(warnings));

  return {
    valid: uniqueErrors.length === 0,
    types: Array.from(types),
    context,
    properties: Array.from(properties),
    errors: uniqueErrors,
    warnings: uniqueWarnings,
    itemCount,
    parsed,
  };
}

/**
 * Extracts and validates all JSON-LD blocks from HTML
 */
export function extractAndValidateAllFromHtml(html: string): ExtractedSchemaItem[] {
  const jsonBlocks = extractJsonLdFromHtml(html);

  return jsonBlocks.map((rawJson, index) => {
    const validation = validateSchema(rawJson);
    const primaryType = validation.types.length > 0 ? validation.types.join(', ') : 'Unknown';

    return {
      index: index + 1,
      type: primaryType,
      rawJson,
      parsed: validation.parsed,
      validation,
    };
  });
}
