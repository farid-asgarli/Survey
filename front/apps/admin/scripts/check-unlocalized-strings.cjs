#!/usr/bin/env node

/**
 * Unlocalized Strings Checker
 *
 * This script analyzes React/TypeScript files to find potentially unlocalized strings.
 * It detects:
 * - Hardcoded text in JSX elements (e.g., <div>Hello World</div>)
 * - Hardcoded strings in specific props (title, label, placeholder, description, etc.)
 * - Missing t() function calls for user-facing strings
 *
 * Usage: node scripts/check-unlocalized-strings.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Source directory to scan
  srcDir: path.resolve(__dirname, '../src'),

  // File extensions to include
  fileExtensions: ['.tsx', '.jsx'],

  // Directories to exclude (relative to srcDir)
  excludeDirs: [
    'node_modules',
    'DevTest', // Development/testing pages - expected to have hardcoded strings
    '__tests__',
    '__mocks__',
  ],

  // File name patterns to exclude
  excludeFilePatterns: [/\.test\./, /\.spec\./, /\.stories\./],

  // Props that should contain localized strings
  localizableProps: [
    'title',
    'description',
    'label',
    'placeholder',
    'helperText',
    'error',
    'message',
    'text',
    'alt',
    'aria-label',
    'aria-description',
    'tooltip',
    'hint',
    'caption',
    'subtitle',
    'header',
    'footer',
    'buttonText',
    'confirmText',
    'cancelText',
    'submitText',
    'loadingText',
    'emptyText',
    'errorText',
    'successText',
  ],

  // Patterns that are NOT strings requiring localization
  falsePositivePatterns: [
    // Technical/code-related
    /^[a-z][a-zA-Z0-9]*$/, // camelCase identifiers
    /^[A-Z][A-Z0-9_]*$/, // CONSTANT_CASE
    /^[a-z]+(-[a-z]+)+$/, // kebab-case (CSS classes)
    /^#[0-9a-fA-F]{3,8}$/, // Hex colors
    /^rgb|rgba|hsl|hsla\(/, // CSS color functions
    /^[0-9]+(\.[0-9]+)?(px|em|rem|%|vh|vw|deg|s|ms)?$/, // Numbers with units
    /^https?:\/\//, // URLs
    /^\/[a-zA-Z]/, // Path routes (but not just "/")
    /^[a-z]+\.[a-z][a-zA-Z0-9.]+$/, // Dot notation keys (e.g., "common.save")
    /^\s*$/, // Empty or whitespace
    /^[<>{}()\[\]]+$/, // Brackets only
    /^\+?[0-9\s\-().]+$/, // Phone number formats
    /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // Email patterns
    /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/, // Only punctuation/symbols
    /^(true|false|null|undefined)$/i, // Boolean/null literals
    /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$/i, // HTTP methods
    /^(sm|md|lg|xl|2xl|xs|3xl|4xl)$/, // Size variants
    /^(primary|secondary|tertiary|error|warning|success|info|default|outline|filled|ghost|link|destructive|muted|elevated|tonal)$/i, // Component variants
    /^(left|right|center|top|bottom|start|end|middle|between|around|evenly)$/i, // Position keywords
    /^(row|column|grid|flex|block|inline|none|auto|hidden|visible)$/i, // Layout keywords
    /^(asc|desc|ASC|DESC)$/i, // Sort directions
    /^[a-z]{2}(-[A-Z]{2})?$/, // Locale codes (en, en-US)
    /^v?[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-z0-9]+)?$/, // Version numbers
    /^\$\{.*\}$/, // Template literal expressions
    /^&[a-z]+;$/i, // HTML entities
    /^data-[a-z-]+$/i, // Data attributes
    /^on[A-Z][a-zA-Z]+$/, // Event handlers
    /^(className|style|key|ref|id|name|type|value|src|href|target|rel|role|tabIndex|autoFocus|disabled|readOnly|required|checked|selected)$/i, // Common HTML/React attributes
    /^(div|span|p|h[1-6]|a|img|button|input|form|table|tr|td|th|ul|li|ol|nav|header|footer|main|section|article|aside|svg|path)$/i, // HTML tags
    /^[A-Z][a-zA-Z]+Icon$/, // Icon component names
    /^use[A-Z][a-zA-Z]+$/, // Hook names
    /^(application\/|text\/|image\/|audio\/|video\/)/, // MIME types
    /^Bearer\s/, // Auth tokens
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, // UUIDs
    // TypeScript type patterns
    /^Promise(<.*>)?$/, // Promise type
    /^void$/, // void type
    /^void \| Promise/, // Union with Promise
    /^Omit(<.*>)?$/, // Omit utility type
    /^VariantProps$/, // cva VariantProps
    /^, VariantProps/, // partial VariantProps match
    /^= Omit/, // Type alias assignment
    // Code fragments
    /^[0-9]+\s*(&&|\|\||\?|:)/, // Conditional expressions
    /^[a-z]+\s*(&&|\|\|)/, // Logical expressions
    /^:\s*is[A-Z]/, // Type guards
    /\.(get|set|has|delete|map|filter|reduce|forEach)\s*\(/, // Method calls
    /^insertFormatting\(/, // Function calls
    /^\^https?:/, // Regex patterns
    // Arrow/comparison indicators
    /^→$/, // Arrow symbols
    /^←$/, // Arrow symbols
    /^↑$/, // Arrow symbols
    /^↓$/, // Arrow symbols
    /^Low → High$/, // Range indicators in charts
    // Emoji and special chars
    /^[\u{1F300}-\u{1F9FF}]$/u, // Emoji
  ],

  // Specific string values to ignore (exact match, case insensitive)
  ignoreStrings: new Set([
    // UI units
    'px',
    'em',
    'rem',
    '%',
    'vh',
    'vw',
    's',
    'ms',
    // Common symbols
    '...',
    '—',
    '–',
    '•',
    '→',
    '←',
    '↑',
    '↓',
    '×',
    '✓',
    '✕',
    '…',
    // Single characters and operators
    '/',
    '|',
    '-',
    '+',
    '*',
    ':',
    ';',
    ',',
    '.',
    '?',
    '!',
    '@',
    '#',
    '$',
    '&',
    '=',
    // Technical terms that don't need translation
    'id',
    'uuid',
    'api',
    'url',
    'json',
    'xml',
    'html',
    'css',
    'svg',
    'png',
    'jpg',
    'gif',
    'pdf',
    // Common short labels
    'ok',
    'n/a',
    'tbd',
    'etc',
    // File extensions
    '.tsx',
    '.ts',
    '.js',
    '.jsx',
    '.json',
    '.md',
    '.css',
    '.scss',
    // Keyboard keys
    'tab',
    'enter',
    'esc',
    'escape',
    'shift',
    'ctrl',
    'alt',
    'cmd',
    'space',
    // Technical abbreviations
    'rgb',
    'hex',
    'utf-8',
    'utf8',
    'ascii',
    'iso',
    'http',
    'https',
    'ftp',
    'ssh',
    'ws',
    'wss',
    // TypeScript types
    'promise',
    'void',
    'any',
    'never',
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'omit',
    'pick',
    'partial',
    'required',
    'readonly',
    'record',
    // Common code tokens that show up in fragments
    'filters:',
    'filters',
    // Short words that are usually technical
    'low',
    'high',
    'min',
    'max',
    'avg',
  ]),

  // Words/patterns that often appear in component names or CSS, not user text
  technicalContextPatterns: [
    /^(Container|Wrapper|Provider|Context|Layout|Section|Content|Header|Footer|Sidebar|Modal|Dialog|Drawer|Panel|Card|List|Item|Row|Cell|Grid)$/,
    /^(Handler|Callback|Listener|Observer|Subscriber|Emitter|Dispatcher)$/,
    /^(Manager|Controller|Service|Repository|Store|Reducer|Action|Selector|Middleware|Hook)$/,
  ],
};

/**
 * Walk directory recursively and get all files
 */
function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Check if directory should be excluded
      const dirName = path.basename(filePath);
      if (CONFIG.excludeDirs.includes(dirName)) {
        continue;
      }
      walkDir(filePath, fileList);
    } else if (stat.isFile()) {
      // Check extension
      const ext = path.extname(file);
      if (!CONFIG.fileExtensions.includes(ext)) {
        continue;
      }

      // Check file name patterns
      const shouldExclude = CONFIG.excludeFilePatterns.some((pattern) => pattern.test(file));
      if (shouldExclude) {
        continue;
      }

      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Check if a string value is likely a false positive
 */
function isLikelyFalsePositive(value) {
  const trimmed = value.trim();

  // Check against ignore set
  if (CONFIG.ignoreStrings.has(trimmed.toLowerCase())) {
    return true;
  }

  // Check against false positive patterns
  for (const pattern of CONFIG.falsePositivePatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // Check technical context patterns
  for (const pattern of CONFIG.technicalContextPatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // Very short strings (less than 2 chars) are usually not translatable
  if (trimmed.length < 2) {
    return true;
  }

  // Strings that are just numbers or numbers with common suffixes
  if (/^-?[0-9.,]+[%]?$/.test(trimmed)) {
    return true;
  }

  // Check if it looks like a translation key (contains dots suggesting namespace)
  if (/^[a-z]+(\.[a-z][a-zA-Z0-9]+)+$/.test(trimmed)) {
    return true;
  }

  // Single letter with optional number (like "A1", "B", etc.)
  if (/^[A-Za-z][0-9]?$/.test(trimmed)) {
    return true;
  }

  // CSS class patterns (multiple hyphenated or underscored words)
  if (/^[a-z]+[-_][a-z]+([-_][a-z]+)*$/i.test(trimmed)) {
    return true;
  }

  // Code-like patterns that slip through
  // TypeScript generics or angle brackets
  if (/^<[^>]+>$/.test(trimmed) || /<\/?[A-Z]/.test(trimmed)) {
    return true;
  }

  // Looks like a function call or code expression
  if (/^[a-zA-Z]+\s*\(/.test(trimmed) || /\)\s*$/.test(trimmed)) {
    return true;
  }

  // Starts with comparison/logical operators (code fragments)
  if (/^(0\s*\?|0\s*&&|0\s*\|\||[!=<>]+\s*)/.test(trimmed)) {
    return true;
  }

  // Contains common code symbols in the middle suggesting it's code
  if (/\s(&&|\|\||===?|!==?|\?\?)\s/.test(trimmed)) {
    return true;
  }

  // Emoji-only content
  if (/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(trimmed)) {
    return true;
  }

  // Single emoji with optional text after (like "✉️")
  if (/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(trimmed)) {
    return true;
  }

  // TypeScript type annotations and expressions (e.g., "(e: React.ChangeEvent")
  if (/^\([a-z]+:\s*(React\.|[A-Z][a-zA-Z]+<)/.test(trimmed)) {
    return true;
  }

  // Common TypeScript/generic patterns
  if (/^<[A-Z][a-zA-Z]+>$/.test(trimmed) || /^as\s+[A-Z]/.test(trimmed)) {
    return true;
  }

  // Regex pattern strings
  if (/^\^/.test(trimmed) && /[\\]/.test(trimmed)) {
    return true;
  }

  // Method chain fragments (starts with .)
  if (/^\.[a-z]+\(/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Determine the severity of an issue
 */
function determineSeverity(value, propName, context) {
  const trimmed = value.trim();

  // High severity: Clear user-facing strings with multiple words in important props
  if (propName && ['title', 'description', 'label', 'message', 'error', 'placeholder', 'helperText'].includes(propName)) {
    if (/\s+/.test(trimmed) && trimmed.length > 10) {
      return 'high';
    }
    if (/\s+/.test(trimmed)) {
      return 'medium';
    }
    // Single word in these props - check if it looks like real text
    if (/^[A-Z][a-z]+$/.test(trimmed)) {
      return 'medium';
    }
  }

  // High severity: Full sentences (contain space and end with punctuation or proper structure)
  if (/^[A-Z][^]*[.!?:]$/.test(trimmed) && /\s+/.test(trimmed)) {
    return 'high';
  }

  // High severity: Multi-word phrases that look like user text
  if (/^[A-Z][a-z]+(\s+[a-z]+)+$/.test(trimmed) && trimmed.length > 15) {
    return 'high';
  }

  // Medium severity: Single capitalized words or short phrases
  if (/^[A-Z][a-z]+(\s+[A-Za-z]+)?$/.test(trimmed)) {
    return 'medium';
  }

  // Medium severity: JSX text that looks like a button label or heading
  if (context && /<(Button|h[1-6]|title|label)/i.test(context) && /^[A-Z]/.test(trimmed)) {
    return 'medium';
  }

  // Low severity: Everything else
  return 'low';
}

/**
 * Extract hardcoded text content from JSX
 */
function extractJsxTextContent(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Track if we're inside a JSX expression or comment
  let inComment = false;
  let inJsxExpression = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Skip comment lines
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) {
      continue;
    }

    // Skip type definition lines
    if (/^\s*(type|interface|export\s+type|export\s+interface)\s/.test(line)) {
      continue;
    }

    // Skip import lines
    if (/^\s*import\s/.test(line)) {
      continue;
    }

    // Look for text content between tags: >text<
    // This regex is more careful to avoid matching inside expressions
    const jsxTextPattern = />([^<>{}`\n]+)</g;
    let match;

    while ((match = jsxTextPattern.exec(line)) !== null) {
      let textContent = match[1];

      // Skip if contains template literal markers
      if (textContent.includes('$') || textContent.includes('`')) {
        continue;
      }

      // Trim and check
      textContent = textContent.trim();

      // Skip empty or whitespace
      if (!textContent) {
        continue;
      }

      // Skip if it looks like a JS expression result
      if (/^[\s]*$/.test(textContent)) {
        continue;
      }

      // Skip code fragments that slip through - TypeScript operators/syntax
      if (/^[,=<>&|!?:]+$/.test(textContent)) {
        continue;
      }

      // Skip things that look like code (contains :: or => or common operators in fragments)
      if (/::|\s*=>\s*|^\s*\|\s*$/.test(textContent)) {
        continue;
      }

      // Skip if it looks like a partial expression (starts/ends with operators)
      if (/^[,=<>&|!?:.\s]|[,=<>&|!?:\s]$/.test(textContent)) {
        continue;
      }

      // Check for false positives
      if (isLikelyFalsePositive(textContent)) {
        continue;
      }

      // Check if there's a nearby t() call on the same or adjacent lines
      const contextStart = Math.max(0, lineIndex - 1);
      const contextEnd = Math.min(lines.length - 1, lineIndex + 1);
      const nearbyContext = lines.slice(contextStart, contextEnd + 1).join('\n');

      // Skip if it appears to be inside or near a translation call
      if (/t\s*\(\s*['"`]/.test(nearbyContext) && nearbyContext.indexOf(textContent) !== -1) {
        // More careful check - is this exact text the result of a t() call?
        const tCallPattern = new RegExp(`t\\s*\\([^)]*\\).*${escapeRegex(textContent.substring(0, 20))}`);
        if (tCallPattern.test(nearbyContext)) {
          continue;
        }
      }

      const severity = determineSeverity(textContent, null, line);

      issues.push({
        file: filePath,
        line: lineIndex + 1,
        column: match.index + 2,
        type: 'jsx-text',
        context: line.trim().substring(0, 120),
        value: textContent,
        severity,
      });
    }
  }

  return issues;
}

/**
 * Extract hardcoded prop values
 */
function extractPropValues(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  for (const propName of CONFIG.localizableProps) {
    // Match prop="value" or prop='value' patterns (not prop={expression})
    const propPattern = new RegExp(`\\b${escapeRegex(propName)}\\s*=\\s*["']([^"'{}]+)["']`, 'g');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip comment lines
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) {
        continue;
      }

      let match;
      while ((match = propPattern.exec(line)) !== null) {
        const propValue = match[1].trim();

        // Skip if it looks like a translation key
        if (/^[a-z]+(\.[a-z][a-zA-Z0-9]+)+$/.test(propValue)) {
          continue;
        }

        // Skip false positives
        if (isLikelyFalsePositive(propValue)) {
          continue;
        }

        // Skip very short values for certain props
        if (propValue.length < 3 && ['aria-label', 'alt'].includes(propName)) {
          continue;
        }

        // Skip technical prop values that commonly appear
        if (/^[a-z]+(-[a-z]+)*$/.test(propValue) && propValue.length < 20) {
          // Likely a CSS class or variant name
          continue;
        }

        const severity = determineSeverity(propValue, propName, line);

        issues.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'prop-value',
          propName,
          context: line.trim().substring(0, 120),
          value: propValue,
          severity,
        });
      }
    }
  }

  return issues;
}

/**
 * Check for translation calls with inline fallbacks that should be in translation files
 */
function checkTranslationFallbacks(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Pattern for t('key', 'Fallback text') - the fallback might need to be in translation files
  const fallbackPattern = /t\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match;

    while ((match = fallbackPattern.exec(line)) !== null) {
      const key = match[1];
      const fallbackText = match[2].trim();

      // Only flag longer fallbacks that look like they should be in translation files
      if (fallbackText.length > 25 && /\s+/.test(fallbackText)) {
        issues.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'translation-fallback',
          context: line.trim().substring(0, 120),
          value: fallbackText,
          translationKey: key,
          severity: 'low',
        });
      }
    }
  }

  return issues;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  // Check if file uses translations
  const usesTranslation = /useTranslation|i18next|window\.__i18n|\.t\s*\(/.test(content);

  // Extract issues
  issues.push(...extractJsxTextContent(content, filePath));
  issues.push(...extractPropValues(content, filePath));

  // Only check fallbacks if file uses translations
  if (usesTranslation) {
    issues.push(...checkTranslationFallbacks(content, filePath));
  }

  return issues;
}

/**
 * Scan all files in the source directory
 */
function scanDirectory() {
  const result = {
    totalFiles: 0,
    filesWithIssues: 0,
    issues: [],
    byFile: new Map(),
    bySeverity: {
      high: [],
      medium: [],
      low: [],
    },
  };

  // Get all files
  const files = walkDir(CONFIG.srcDir);
  result.totalFiles = files.length;

  // Scan each file
  for (const file of files) {
    const relativePath = path.relative(CONFIG.srcDir, file);
    const issues = scanFile(file);

    if (issues.length > 0) {
      result.filesWithIssues++;

      // Update relative paths and organize
      const fileIssues = issues.map((issue) => ({
        ...issue,
        file: relativePath,
      }));

      result.byFile.set(relativePath, fileIssues);

      for (const issue of fileIssues) {
        result.issues.push(issue);
        result.bySeverity[issue.severity].push(issue);
      }
    }
  }

  return result;
}

/**
 * Generate markdown report
 */
function generateReport(result) {
  const lines = [];

  lines.push('# Unlocalized Strings Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total files scanned | ${result.totalFiles} |`);
  lines.push(`| Files with issues | ${result.filesWithIssues} |`);
  lines.push(`| Total issues found | ${result.issues.length} |`);
  lines.push(`| 🔴 High severity | ${result.bySeverity.high.length} |`);
  lines.push(`| 🟡 Medium severity | ${result.bySeverity.medium.length} |`);
  lines.push(`| 🟢 Low severity | ${result.bySeverity.low.length} |`);
  lines.push('');

  // Severity explanations
  lines.push('### Severity Levels');
  lines.push('');
  lines.push('- **🔴 High:** Clear user-facing strings that should definitely be localized (multi-word phrases, sentences, important UI text)');
  lines.push('- **🟡 Medium:** Strings that might need localization depending on context (single words, short labels)');
  lines.push('- **🟢 Low:** Likely acceptable or false positives (technical labels, translation fallbacks)');
  lines.push('');

  // Quick navigation by category
  lines.push('### Quick Navigation by Category');
  lines.push('');

  // Categorize files
  const categories = {
    'UI Components': [],
    'Feature Components': [],
    Pages: [],
    Other: [],
  };

  for (const [file, issues] of result.byFile) {
    const category = file.startsWith('components/ui/')
      ? 'UI Components'
      : file.startsWith('components/features/')
      ? 'Feature Components'
      : file.startsWith('pages/')
      ? 'Pages'
      : 'Other';
    const highCount = issues.filter((i) => i.severity === 'high').length;
    const mediumCount = issues.filter((i) => i.severity === 'medium').length;
    const lowCount = issues.filter((i) => i.severity === 'low').length;
    categories[category].push({ file, highCount, mediumCount, lowCount, total: issues.length });
  }

  for (const [category, files] of Object.entries(categories)) {
    if (files.length === 0) continue;

    const totalHigh = files.reduce((sum, f) => sum + f.highCount, 0);
    const totalMed = files.reduce((sum, f) => sum + f.mediumCount, 0);

    lines.push(`**${category}** (${files.length} files)`);
    if (totalHigh > 0 || totalMed > 0) {
      lines.push(`- 🔴 ${totalHigh} high, 🟡 ${totalMed} medium priority`);
    }
    lines.push('');
  }

  // High severity issues
  if (result.bySeverity.high.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🔴 High Severity Issues');
    lines.push('');
    lines.push('These are user-facing strings that should be localized.');
    lines.push('');

    // Group by file
    const byFile = new Map();
    for (const issue of result.bySeverity.high) {
      const existing = byFile.get(issue.file) || [];
      existing.push(issue);
      byFile.set(issue.file, existing);
    }

    for (const [file, issues] of byFile) {
      lines.push(`### 📄 ${file}`);
      lines.push('');

      for (const issue of issues) {
        const propInfo = issue.propName ? ` (prop: \`${issue.propName}\`)` : '';
        lines.push(`**Line ${issue.line}**${propInfo}`);
        lines.push('');
        lines.push(`- **String:** \`${issue.value}\``);
        lines.push(`- **Context:** \`${issue.context}\``);
        lines.push('');
      }
    }
  }

  // Medium severity issues
  if (result.bySeverity.medium.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🟡 Medium Severity Issues');
    lines.push('');
    lines.push('Review these strings in context to determine if localization is needed.');
    lines.push('');

    // Group by file
    const byFile = new Map();
    for (const issue of result.bySeverity.medium) {
      const existing = byFile.get(issue.file) || [];
      existing.push(issue);
      byFile.set(issue.file, existing);
    }

    for (const [file, issues] of byFile) {
      lines.push(`### 📄 ${file}`);
      lines.push('');
      lines.push('| Line | Type | String |');
      lines.push('|------|------|--------|');

      for (const issue of issues) {
        const typeStr = issue.propName ? `\`${issue.propName}\`` : 'JSX text';
        const valueStr = issue.value.length > 40 ? issue.value.substring(0, 40) + '...' : issue.value;
        lines.push(`| ${issue.line} | ${typeStr} | \`${valueStr}\` |`);
      }
      lines.push('');
    }
  }

  // Low severity issues (collapsed)
  if (result.bySeverity.low.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🟢 Low Severity Issues');
    lines.push('');
    lines.push('These are likely acceptable or false positives. Review only if time permits.');
    lines.push('');
    lines.push(`**Total:** ${result.bySeverity.low.length} issues`);
    lines.push('');
    lines.push('<details>');
    lines.push('<summary>Click to expand low severity issues</summary>');
    lines.push('');

    // Group by file
    const byFile = new Map();
    for (const issue of result.bySeverity.low) {
      const existing = byFile.get(issue.file) || [];
      existing.push(issue);
      byFile.set(issue.file, existing);
    }

    for (const [file, issues] of byFile) {
      lines.push(`#### ${file}`);
      lines.push('');
      for (const issue of issues) {
        const truncatedValue = issue.value.length > 50 ? issue.value.substring(0, 50) + '...' : issue.value;
        lines.push(`- Line ${issue.line}: \`${truncatedValue}\``);
      }
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
  }

  // Recommendations
  lines.push('---');
  lines.push('');
  lines.push('## How to Fix');
  lines.push('');
  lines.push('### For JSX Text Content');
  lines.push('');
  lines.push('```tsx');
  lines.push('// ❌ Before');
  lines.push('<Button>Save Changes</Button>');
  lines.push('');
  lines.push('// ✅ After');
  lines.push("import { useTranslation } from 'react-i18next';");
  lines.push('');
  lines.push('const { t } = useTranslation();');
  lines.push("<Button>{t('common.saveChanges')}</Button>");
  lines.push('```');
  lines.push('');
  lines.push('### For Prop Values');
  lines.push('');
  lines.push('```tsx');
  lines.push('// ❌ Before');
  lines.push('<Input placeholder="Enter your email" />');
  lines.push('');
  lines.push('// ✅ After');
  lines.push("<Input placeholder={t('form.emailPlaceholder')} />");
  lines.push('```');
  lines.push('');
  lines.push('### Adding to Translation Files');
  lines.push('');
  lines.push('Add new keys to `src/i18n/locales/en.json` (and other language files):');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "common": {');
  lines.push('    "saveChanges": "Save Changes"');
  lines.push('  },');
  lines.push('  "form": {');
  lines.push('    "emailPlaceholder": "Enter your email"');
  lines.push('  }');
  lines.push('}');
  lines.push('```');

  return lines.join('\n');
}

// Main execution
console.log('🔍 Scanning for unlocalized strings...\n');
console.log(`📁 Source directory: ${CONFIG.srcDir}\n`);

const result = scanDirectory();

console.log(`✅ Scanned ${result.totalFiles} files`);
console.log(`📝 Found ${result.issues.length} potential issues in ${result.filesWithIssues} files\n`);

// Generate and save report
const report = generateReport(result);
const reportPath = path.join(__dirname, '../UNLOCALIZED_STRINGS_REPORT.md');
fs.writeFileSync(reportPath, report);

console.log(`📄 Report saved to: ${reportPath}\n`);

// Print summary
console.log('--- Summary ---');
console.log(`🔴 High severity:   ${result.bySeverity.high.length}`);
console.log(`🟡 Medium severity: ${result.bySeverity.medium.length}`);
console.log(`🟢 Low severity:    ${result.bySeverity.low.length}`);

// Print top high severity issues
if (result.bySeverity.high.length > 0) {
  console.log('\n--- Top High Severity Issues ---');
  const topIssues = result.bySeverity.high.slice(0, 5);
  for (const issue of topIssues) {
    console.log(`\n📍 ${issue.file}:${issue.line}`);
    console.log(`   "${issue.value}"`);
  }
  if (result.bySeverity.high.length > 5) {
    console.log(`\n   ... and ${result.bySeverity.high.length - 5} more`);
  }
}

console.log('\n');

// Exit with appropriate code
if (result.bySeverity.high.length > 0) {
  console.log('⚠️  High severity issues found. Review the report for details.');
  process.exit(1);
} else {
  console.log('✨ No high severity issues found!');
  process.exit(0);
}
