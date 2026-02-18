const terms = ['lantern','alchemist','miner','battering','traveler','clothes','scroll case','saddle','merchant scale','portable ram','saddlebag'];
let all = [], next = 'https://api.open5e.com/v2/items/?document__slug=wotc-srd&limit=500';
process.stdout.write('Fetching');
while (next) { const r = await fetch(next); const j = await r.json(); all.push(...j.results); next = j.next; process.stdout.write('.'); }
console.log(` (${all.length})`);
const found = all.filter(i => terms.some(t => i.name.toLowerCase().includes(t)));
found.forEach(i => console.log(`"${i.name}"`));
