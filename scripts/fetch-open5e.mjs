// Run: node scripts/fetch-open5e.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Manual aliases: norm(our name) → norm(Open5e name)
// Keys and values must be fully normalized (lowercase, alphanumeric only — no spaces)
const ALIASES = {
  'sheild':                   'shield',
  'halbred':                  'halberd',
  'breastplatearmor':         'breastplate',
  'chainmailarmor':           'chainmail',
  'halfplatearmor':           'halfplate',
  'plate':                    'platearmor',
  // Alchemist (Open5e uses apostrophe: "Alchemist's Fire")
  'alchemistfire':            'alchemistsfire',
  'alchemistsupplies':        'alchemistssupplies',
  // Clothes (Open5e format: "Clothes, Common")
  'commonclothes':            'clothescommon',
  'fineclothes':              'clothesfine',
  'travelersclothes':         'clothestravelers',
  'costumeclothes':           'clothescostume',
  // Lanterns (Open5e format: "Lantern, Bullseye")
  'bullseyelantern':          'lanternbullseye',
  'hoodedlantern':            'lanternhooded',
  // Saddles (Open5e format: "Saddle (Exotic)")
  'exoticsaddle':             'saddleexotic',
  'militarysaddle':           'saddlemilitary',
  'ridingsaddle':             'saddleriding',
  'packsaddle':               'saddlepack',
  // Pick (Open5e: "Pick, miner's")
  'minerspick':               'pickminers',
  // Potions
  'potionofextremehealing':   'potionofsuperiorhealing',
};

async function fetchAll(url) {
  const results = [];
  let next = url;
  while (next) {
    const res = await fetch(next);
    if (!res.ok) { console.log(`  ⚠ ${url} returned ${res.status}`); break; }
    const json = await res.json();
    results.push(...(json.results ?? []));
    next = json.next;
    process.stdout.write('.');
  }
  console.log(` (${results.length})`);
  return results;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
process.stdout.write('v2/items wotc-srd ');
const items2014 = await fetchAll('https://api.open5e.com/v2/items/?document__slug=wotc-srd&limit=500');

process.stdout.write('v2/items srd-2024 ');
const items2024 = await fetchAll('https://api.open5e.com/v2/items/?document__slug=srd-2024&limit=500');

process.stdout.write('v1/weapons ');
const weapons = await fetchAll('https://api.open5e.com/v1/weapons/?document__slug=wotc-srd&limit=200');

process.stdout.write('v2/armor ');
const armorList = await fetchAll('https://api.open5e.com/v2/armor/?limit=200');

// ── Build lookup maps ─────────────────────────────────────────────────────────
const weaponMap = new Map();
for (const w of weapons) {
  weaponMap.set(norm(w.name), {
    damage_dice: w.damage_dice ?? null,
    damage_type: w.damage_type ?? null,
    properties: w.properties ?? [],
  });
}

// Armor map — include category (light/medium/heavy)
const armorMap = new Map();
for (const a of armorList) {
  armorMap.set(norm(a.name), {
    ac_display: a.ac_display ?? null,
    stealth_disadvantage: a.grants_stealth_disadvantage ?? null,
    strength_required: a.strength_score_required ?? null,
    armor_type: a.category ?? null, // "light" | "medium" | "heavy"
  });
}

// Main item map
const itemMap = new Map();
for (const item of [...items2024, ...items2014]) {
  const key = norm(item.name);
  if (!itemMap.has(key)) {
    const gp = parseFloat(item.cost ?? '');
    itemMap.set(key, {
      cost: item.cost != null && !isNaN(gp) ? `${gp} gp` : null,
      weight: item.weight ? `${parseFloat(item.weight)} lb.` : null,
      desc: item.desc ?? null,
      category_detail: item.category?.name ?? null,
    });
  }
}
console.log(`Lookups: items=${itemMap.size}, weapons=${weaponMap.size}, armor=${armorMap.size}`);

// ── Helper: find in map with aliases + partial ────────────────────────────────
function findIn(map, rawName) {
  const key = norm(rawName);
  const aliasKey = ALIASES[key] ?? key;

  // 1. exact
  if (map.has(aliasKey)) return map.get(aliasKey);
  if (map.has(key)) return map.get(key);

  // 2. partial — alias key contained in map key or vice versa
  for (const [k, v] of map) {
    if (k.includes(aliasKey) || aliasKey.includes(k)) return v;
  }
  for (const [k, v] of map) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}

// ── Load items.ts ─────────────────────────────────────────────────────────────
const itemsTsPath = join(__dir, '../src/data/items.ts');
const itemsTs = readFileSync(itemsTsPath, 'utf-8');

const itemRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*([^,]+),\s*category:\s*([^,]+),\s*image:\s*([^,]+),\s*stats:[^}]+\}/g;
const ourItems = [];
let m;
while ((m = itemRegex.exec(itemsTs)) !== null) {
  const parse = s => JSON.parse(s.trim());
  ourItems.push({
    id: m[1],
    name: parse(m[2]),
    category: parse(m[3]),
    image: parse(m[4]),
  });
}
console.log(`Our items: ${ourItems.length}`);

// ── Rename breastplate ────────────────────────────────────────────────────────
for (const item of ourItems) {
  if (item.name === 'breastplate armor copy') {
    item.name = 'Breastplate Armor';
    item.image = '/cards/Armor/Breastplate Armor.png';
  }
}

// ── Match & enrich ────────────────────────────────────────────────────────────
let matched = 0;
const enriched = ourItems.map(item => {
  const base   = findIn(itemMap, item.name);
  const weapon = findIn(weaponMap, item.name);
  const armor  = findIn(armorMap, item.name);

  if (base || weapon || armor) matched++;

  // Build armor category_detail: "Light Armor", "Medium Armor", "Heavy Armor"
  let category_detail = base?.category_detail ?? null;
  if (armor?.armor_type) {
    category_detail = armor.armor_type.charAt(0).toUpperCase() + armor.armor_type.slice(1) + ' Armor';
  }

  const stats = (base || weapon || armor) ? {
    cost:                 base?.cost ?? null,
    weight:               base?.weight ?? null,
    damage_dice:          weapon?.damage_dice ?? null,
    damage_type:          weapon?.damage_type ?? null,
    properties:           weapon?.properties ?? [],
    category_detail,
    description:          base?.desc ?? null,
    ac_display:           armor?.ac_display ?? null,
    stealth_disadvantage: armor?.stealth_disadvantage ?? null,
    strength_required:    armor?.strength_required ?? null,
  } : null;

  return { ...item, stats };
});

console.log(`Matched: ${matched}/${ourItems.length}`);
const unmatched = enriched.filter(i => !i.stats).map(i => i.name);
if (unmatched.length) console.log('Unmatched:', unmatched.join(', '));

// ── Write ─────────────────────────────────────────────────────────────────────
const lines = enriched.map(item =>
  `  { id: '${item.id}', name: ${JSON.stringify(item.name)}, category: ${JSON.stringify(item.category)}, image: ${JSON.stringify(item.image)}, stats: ${JSON.stringify(item.stats)} },`
);

writeFileSync(itemsTsPath, `import type { Item } from '../types/item';\n\nexport const allItems: Item[] = [\n${lines.join('\n')}\n];\n\nexport const categories = [...new Set(allItems.map((i) => i.category))].sort();\n`);
console.log('✅ Done');
