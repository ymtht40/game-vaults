// Variable Mapping: c -> SUPPORTED_TYPES, d -> getValidConfigurables, f -> isValidConfigurable, m -> attributeToCamelCase, g -> formatCodeLiteral, p -> VALUE_PATTERN, h -> escapeRegExp, N -> DEFAULT_CUSTOMIZE_OFFSET?,B -> applyHtmlConfigurables, t -> applyReactConfigurables, n -> applyVueConfigurables, o -> getConfigurableCount, C -> getPrimarySelectorAttribute

const SUPPORTED_TYPES = new Set([
  'number',
  'float',
  'boolean',
  'select',
  'color',
]);

// NOTE: module id: 726368
export const DEFAULT_CUSTOMIZE_OFFSET = 0;

export function getValidConfigurables(animation) {
  const attributes = animation?.attributes;
  const configurables =
    attributes?.attributes?.configurables || attributes?.configurables || [];
  return Array.isArray(configurables)
    ? configurables.filter(isValidConfigurable)
    : [];
}

function isValidConfigurable(item) {
  if (!item || !item.attribute) return false;
  const type = String(item.type || '').toLowerCase();
  if (!SUPPORTED_TYPES.has(type)) return false;

  if (type === 'number' || type === 'float') {
    return (
      Number.isFinite(Number(item.min)) &&
      Number.isFinite(Number(item.max)) &&
      item.value !== '' &&
      Number.isFinite(Number(item.value))
    );
  }

  if (type === 'select') {
    return (
      Array.isArray(item.options) &&
      item.options.length > 1 &&
      item.options.includes(item.value)
    );
  }

  if (type === 'boolean') {
    const normalized = String(item.value).toLowerCase();
    return normalized === 'true' || normalized === 'false';
  }

  return (
    type !== 'color' || /^#[0-9a-fA-F]{3,8}$/.test(String(item.value || ''))
  );
}

function attributeToCamelCase(attribute) {
  return String(attribute || '')
    .replace(/^data-anm-/, '')
    .replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function formatCodeLiteral(value, type) {
  const normalizedType = String(type || '').toLowerCase();
  if (normalizedType === 'number' || normalizedType === 'float') {
    const num = Number(value);
    return Number.isFinite(num) ? String(num) : null;
  }
  if (normalizedType === 'boolean') {
    return value === true || value === 'true' ? 'true' : 'false';
  }
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const VALUE_PATTERN = "('[^']*'|\"[^\"]*\"|[^,}\\s][^,}]*)";

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyHtmlConfigurables(code, values, primarySelector) {
  let result = String(code || '');
  if (!result) return result;

  for (const [attribute, rawValue] of Object.entries(values || {})) {
    if (rawValue == null || rawValue === '') continue;
    const strValue = String(rawValue);
    const attrPattern = RegExp(
      `(?<![-\\w])${escapeRegExp(attribute)}\\s*=\\s*"[^"]*"`
    );

    if (attrPattern.test(result)) {
      result = result.replace(attrPattern, () => `${attribute}="${strValue}"`);
    } else {
      const selectorPattern = RegExp(
        `(?<![-\\w])${escapeRegExp(primarySelector)}(\\s*=\\s*"[^"]*")?`
      );
      result = result.replace(
        selectorPattern,
        (match) => `${match} ${attribute}="${strValue}"`
      );
    }
  }

  return result;
}

export function applyReactConfigurables(code, values, configurables) {
  const source = String(code || '');
  if (!source) return source;

  const signatureMatch = source.match(
    /export default function \w+\s*\(\s*\{[\s\S]*?\}\s*\)/
  );
  if (!signatureMatch) return source;

  let updatedSignature = signatureMatch[0];
  for (const [attribute, rawValue] of Object.entries(values || {})) {
    if (rawValue == null || rawValue === '') continue;
    const configItem = (configurables || []).find(
      (item) => item.attribute === attribute
    );
    const literal = formatCodeLiteral(rawValue, configItem?.type);
    if (literal == null) continue;

    const propName = attributeToCamelCase(attribute);
    const propPattern = RegExp(
      `(\\b${escapeRegExp(propName)}\\s*=\\s*)${VALUE_PATTERN}`
    );
    updatedSignature = updatedSignature.replace(
      propPattern,
      (_, prefix) => `${prefix}${literal}`
    );
  }

  return source.replace(signatureMatch[0], () => updatedSignature);
}

export function applyVueConfigurables(code, values, configurables) {
  let result = String(code || '');
  if (!result) return result;

  for (const [attribute, rawValue] of Object.entries(values || {})) {
    if (rawValue == null || rawValue === '') continue;
    const configItem = (configurables || []).find(
      (item) => item.attribute === attribute
    );
    const literal = formatCodeLiteral(rawValue, configItem?.type);
    if (literal == null) continue;

    const propName = attributeToCamelCase(attribute);
    const propPattern = RegExp(
      `(\\b${escapeRegExp(propName)}\\s*:\\s*\\{[^}]*?\\bdefault:\\s*)${VALUE_PATTERN}`
    );
    result = result.replace(propPattern, (_, prefix) => `${prefix}${literal}`);
  }

  return result;
}

export function getConfigurableCount(animation) {
  return getValidConfigurables(animation).length;
}

export function slugToPascalCase(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

export function getPrimarySelectorAttribute(animation) {
  const attributes = animation?.attributes;
  const selectors =
    attributes?.attributes?.selectors || attributes?.selectors || [];
  const primary =
    selectors.find((selector) => selector?.required && selector?.attribute) ||
    selectors[0];
  return primary?.attribute || `data-anm-${animation?.slug || ''}`;
}
