#!/usr/bin/env node

/**
 * Locale Sync Script
 * Syncs az.json and ru.json with en.json structure
 * - Removes keys not present in en.json
 * - Adds missing keys with placeholder values that cause syntax issues
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_JSON_PATH = path.join(LOCALES_DIR, 'en.json');
const AZ_JSON_PATH = path.join(LOCALES_DIR, 'az.json');
const RU_JSON_PATH = path.join(LOCALES_DIR, 'ru.json');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get all keys from a nested object with dot notation
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get value from object using dot notation path
 */
function getValue(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Set value in object using dot notation path
 */
function setValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Remove value from object using dot notation path
 */
function removeValue(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return;
    }
  }

  if (current && typeof current === 'object') {
    delete current[parts[parts.length - 1]];
  }
}

/**
 * Remove empty objects recursively
 */
function removeEmptyObjects(obj) {
  const keysToRemove = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      removeEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        keysToRemove.push(key);
      }
    }
  }

  for (const key of keysToRemove) {
    delete obj[key];
  }
}

/**
 * Sync a locale file with the source (en.json)
 */
function syncLocaleFile(sourceJson, targetJson, targetName) {
  const sourceKeys = getAllKeys(sourceJson);
  const targetKeys = getAllKeys(targetJson);

  // Find keys to remove (in target but not in source)
  const keysToRemove = targetKeys.filter((key) => !sourceKeys.includes(key));

  // Find keys to add (in source but not in target)
  const keysToAdd = sourceKeys.filter((key) => !targetKeys.includes(key));

  colorLog(`\n=== Processing ${targetName} ===`, 'cyan');
  colorLog(`Keys to remove: ${keysToRemove.length}`, 'yellow');
  colorLog(`Keys to add: ${keysToAdd.length}`, 'green');

  // Remove extra keys
  for (const key of keysToRemove) {
    colorLog(`  Removing: ${key}`, 'red');
    removeValue(targetJson, key);
  }

  // Clean up empty objects after removal
  removeEmptyObjects(targetJson);

  // Add missing keys with placeholder that causes syntax issues
  for (const key of keysToAdd) {
    const sourceValue = getValue(sourceJson, key);
    const placeholder = `TODO_TRANSLATE: ${sourceValue}`;
    colorLog(`  Adding: ${key}`, 'green');
    setValue(targetJson, key, placeholder);
  }

  return targetJson;
}

/**
 * Convert object to formatted JSON with sorted keys
 */
function convertToOrderedJson(obj, indent = 0) {
  const indentStr = '  '.repeat(indent);
  const innerIndent = '  '.repeat(indent + 1);
  let result = '{';
  let first = true;

  // Sort keys alphabetically for consistent output
  const sortedKeys = Object.keys(obj).sort();

  for (const key of sortedKeys) {
    if (!first) {
      result += ',';
    }
    first = false;
    result += `\n${innerIndent}"${key}": `;

    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += convertToOrderedJson(value, indent + 1);
    } else if (Array.isArray(value)) {
      result += JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      result += value ? 'true' : 'false';
    } else if (typeof value === 'number') {
      result += value;
    } else {
      // Escape special characters in strings
      const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      result += `"${escaped}"`;
    }
  }

  result += `\n${indentStr}}`;
  return result;
}

/**
 * Main function
 */
function main() {
  try {
    // Read JSON files
    colorLog('📖 Reading locale files...', 'cyan');

    const enJson = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf-8'));
    const azJson = JSON.parse(fs.readFileSync(AZ_JSON_PATH, 'utf-8'));
    const ruJson = JSON.parse(fs.readFileSync(RU_JSON_PATH, 'utf-8'));

    colorLog('✅ All files loaded successfully', 'green');

    // Process az.json
    const syncedAz = syncLocaleFile(enJson, azJson, 'az.json');
    const azOutput = convertToOrderedJson(syncedAz);
    fs.writeFileSync(AZ_JSON_PATH, azOutput + '\n', 'utf-8');
    colorLog(`\nSaved: ${AZ_JSON_PATH}`, 'cyan');

    // Process ru.json
    const syncedRu = syncLocaleFile(enJson, ruJson, 'ru.json');
    const ruOutput = convertToOrderedJson(syncedRu);
    fs.writeFileSync(RU_JSON_PATH, ruOutput + '\n', 'utf-8');
    colorLog(`Saved: ${RU_JSON_PATH}`, 'cyan');

    colorLog('\n=== Sync Complete ===', 'green');
    colorLog("Review the files for 'TODO_TRANSLATE:' placeholders", 'yellow');
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
