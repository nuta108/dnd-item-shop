import { allItems } from '../src/data/items';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'db.json');

const db = { items: allItems };

writeFileSync(outPath, JSON.stringify(db, null, 2), 'utf-8');
console.log(`Wrote ${allItems.length} items to ${outPath}`);
