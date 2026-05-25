import fs from 'node:fs';
import path from 'node:path';

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const rawValue = trimmed.slice(eq + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadEnvFiles(baseDir) {
  readEnvFile(path.join(baseDir, '.env.local'));
  readEnvFile(path.join(baseDir, '.env'));
}
