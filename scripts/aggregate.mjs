// Aggregates every plugin descriptor in plugins/*.json into plugins.json.
// Descriptors are sorted by filename so output order is deterministic.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginsDir = join(repoRoot, 'plugins');
const outFile = join(repoRoot, 'plugins.json');

const files = readdirSync(pluginsDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

const plugins = files.map((f) => {
  const raw = readFileSync(join(pluginsDir, f), 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse ${f}: ${error.message}`);
  }
});

writeFileSync(outFile, `${JSON.stringify(plugins, null, 2)}\n`, 'utf8');
console.log(`Aggregated ${plugins.length} plugin(s) into plugins.json`);
