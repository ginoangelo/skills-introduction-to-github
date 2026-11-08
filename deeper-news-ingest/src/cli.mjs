#!/usr/bin/env node
// Usage: node src/cli.mjs "Louisville" "Kentucky" "United States" [out.json]

import { writeFile } from 'node:fs/promises';

import { ingestForLocation } from './ingest.mjs';

const [name, region, country, out] = process.argv.slice(2);
if (!name || !country) {
  console.error('Usage: node src/cli.mjs <city> <region or ""> <country> [out.json]');
  process.exit(1);
}

const result = await ingestForLocation({ name, region: region || undefined, country });
console.log(`Near ${name}: ${result.counts.near} · ${country}: ${result.counts.country} · World: ${result.counts.world}`);
for (const c of result.candidates.slice(0, 12)) {
  console.log(`[${c.bucket}] ${c.title} (${c.source}, ${c.sourceCountry})`);
}
if (out) {
  await writeFile(out, JSON.stringify(result, null, 2));
  console.log(`Saved ${result.candidates.length} candidates to ${out}`);
}
