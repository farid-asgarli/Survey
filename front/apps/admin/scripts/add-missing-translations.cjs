#!/usr/bin/env node

/**
 * Script to find all translation keys in the codebase,
 * check if they exist in en.json, and add missing keys with "TODO-Translate" value.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '../src');
const EN_JSON_PATH = path.join(__dirname, '../src/i18n/locales/en.json');
const OUTPUT_FILE = path.join(__dirname, '../temp/MISSING_TRANSLATIONS_REPORT.md');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Translation patterns to search for (only static keys - we can't check dynamic ones)
const translationPatterns = [
  {
    name: 't() - Standard',
    regex: /(?<![.\w])t\s*\(\s*['"]([^'"]+)['"]/g,
  },
  {
    name: 'i18n.t()',
    regex: /i18n\.t\s*\(\s*['"]([^'"]+)['"]/g,
  },
  {
    name: 'window.__i18n?.t()',
    regex: /window\.__i18n\?\.t\s*\(\s*['"]([^'"]+)['"]/g,
  },
];

// Get nested value from object using dot notation
function getNestedValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

// Set nested value in object using dot notation
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'temp'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function findAllTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const lines = content.split('\n');
  const keys = [];

  for (const pattern of translationPatterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const key = match[1];

      // Skip dynamic keys (containing ${...} or variables)
      if (key.includes('${') || key.includes('$')) {
        continue;
      }

      keys.push({
        key,
        file: relativePath,
        lineNumber,
        line: lines[lineNumber - 1]?.trim() || '',
      });
    }
  }

  return keys;
}

function main() {
  console.log('🔍 Finding all translation keys in codebase...\n');

  // Load en.json
  let enJson;
  try {
    const enJsonContent = fs.readFileSync(EN_JSON_PATH, 'utf-8');
    enJson = JSON.parse(enJsonContent);
    console.log(`✅ Loaded en.json from: ${EN_JSON_PATH}\n`);
  } catch (err) {
    console.error(`❌ Failed to load en.json: ${err.message}`);
    process.exit(1);
  }

  // Find all translation keys in codebase
  const files = getAllFiles(ROOT_DIR);
  console.log(`📁 Scanning ${files.length} source files...\n`);

  const allKeys = [];
  for (const file of files) {
    const keys = findAllTranslationKeys(file);
    allKeys.push(...keys);
  }

  // Deduplicate keys
  const uniqueKeysMap = new Map();
  for (const keyInfo of allKeys) {
    if (!uniqueKeysMap.has(keyInfo.key)) {
      uniqueKeysMap.set(keyInfo.key, []);
    }
    uniqueKeysMap.get(keyInfo.key).push(keyInfo);
  }

  console.log(`🔑 Found ${uniqueKeysMap.size} unique translation keys\n`);

  // Check which keys are missing from en.json
  const missingKeys = [];
  const existingKeys = [];

  for (const [key, usages] of uniqueKeysMap) {
    const value = getNestedValue(enJson, key);
    if (value === undefined) {
      missingKeys.push({ key, usages });
    } else {
      existingKeys.push({ key, value, usages });
    }
  }

  console.log(`✅ Keys found in en.json: ${existingKeys.length}`);
  console.log(`❌ Keys MISSING from en.json: ${missingKeys.length}\n`);

  // Add missing keys to en.json
  if (missingKeys.length > 0) {
    console.log('📝 Adding missing keys to en.json with "TODO-Translate" value...\n');

    for (const { key } of missingKeys) {
      setNestedValue(enJson, key, 'TODO-Translate');
      console.log(`   + ${key}`);
    }

    // Write updated en.json
    const updatedJson = JSON.stringify(enJson, null, 2);
    fs.writeFileSync(EN_JSON_PATH, updatedJson + '\n', 'utf-8');
    console.log(`\n✅ Updated en.json with ${missingKeys.length} new keys\n`);
  }

  // Generate report
  const timestamp = new Date().toISOString();

  let report = `# Missing Translations Report

Generated: ${timestamp}

## Summary

| Metric | Count |
|--------|-------|
| Total unique keys in codebase | ${uniqueKeysMap.size} |
| Keys found in en.json | ${existingKeys.length} |
| Keys MISSING (added) | ${missingKeys.length} |

`;

  if (missingKeys.length > 0) {
    report += `## ❌ Missing Keys (Added with "TODO-Translate")

These keys were found in the codebase but were NOT in en.json.
They have been added with the value \`"TODO-Translate"\`.

| Key | Used In |
|-----|---------|
`;

    for (const { key, usages } of missingKeys.sort((a, b) => a.key.localeCompare(b.key))) {
      const filesUsed = [...new Set(usages.map((u) => u.file))].join(', ');
      report += `| \`${key}\` | ${filesUsed} |\n`;
    }

    report += `

### Detailed Usage of Missing Keys

`;

    for (const { key, usages } of missingKeys.sort((a, b) => a.key.localeCompare(b.key))) {
      report += `#### \`${key}\`\n\n`;
      for (const usage of usages) {
        report += `- \`${usage.file}\` (Line ${usage.lineNumber})\n`;
        report += `  \`\`\`\n  ${usage.line}\n  \`\`\`\n`;
      }
      report += '\n';
    }
  } else {
    report += `## ✅ All Keys Present

All translation keys found in the codebase exist in en.json. No action needed.
`;
  }

  report += `
---

## Note About Dynamic Keys

This script only checks **static** translation keys. The following patterns use dynamic keys
and cannot be automatically verified:

- \`t(variable)\` - key from a variable
- \`t(\`prefix.\${dynamic}\`)\` - template literal keys
- \`t(obj.property)\` - key from object property

These should be manually reviewed to ensure all possible runtime values exist in en.json.
`;

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
  console.log(`📄 Report written to: ${OUTPUT_FILE}`);
}

main();
