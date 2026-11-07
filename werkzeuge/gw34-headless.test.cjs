const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'quelle-claude-artifact.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script, { filename: 'goetterwacht_v34.inline.js' });
function fnSource(name) {
  const start = script.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Missing function ${name}`);
  const open = script.indexOf('{', start);
  let depth = 0, quote = '', escape = false;
  for (let i = open; i < script.length; i++) {
    const ch = script[i];
    if (quote) { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return script.slice(start, i + 1);
  }
  throw new Error(`Unclosed function ${name}`);
}
function context(source, extras = {}) { const c = { ...extras }; vm.createContext(c); vm.runInContext(source, c); return c; }
let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }

test('Version 34 or later and exact credit', () => {
  const v = +html.match(/const GAME_VERSION = (\d+);/)[1];
  assert.ok(v >= 34);
  assert.match(html, new RegExp(`id="ver">Version ${v}<\/div>`));
  assert.match(html, /id="credit">Made by a Legend NMO<\/div>/);
});

test('Coin offer only at waves 10, 15 and 20 in this range', () => {
  const c = context(fnSource('isCoinOfferWave'));
  for (const w of [10, 15, 20]) assert.equal(c.isCoinOfferWave(w), true);
  for (let w = 1; w <= 30; w++) if (![10, 15, 20, 25, 30].includes(w)) assert.equal(c.isCoinOfferWave(w), false);
  assert.match(fnSource('waveUpdate'), /openCoinOffer\(\)/);
});

test('Clover raises every owned skill by one, with max caps', () => {
  const c = context(`${fnSource('upgradeCoinSkills')}\n${fnSource('hasCoinSkillUpgrade')}`);
  const run = { weapons: { axe: { lvl: 9 }, hammer: { lvl: 10 } }, passives: { might: 2, eile: 4 } };
  const weapons = { axe: { max: 10 }, hammer: { max: 10 } };
  const passives = { might: { max: 4 }, eile: { max: 4 } };
  assert.equal(c.upgradeCoinSkills(run, weapons, passives), 2);
  assert.deepEqual(JSON.parse(JSON.stringify(run)), { weapons: { axe: { lvl: 10 }, hammer: { lvl: 10 } }, passives: { might: 3, eile: 4 } });
  assert.equal(c.hasCoinSkillUpgrade(run, weapons, passives), true);
  assert.equal(c.upgradeCoinSkills(run, weapons, passives), 1);
  assert.equal(run.passives.might, 4);
  assert.equal(c.hasCoinSkillUpgrade(run, weapons, passives), false);
});

test('All-capped fallback grants one soul level and keeps fate level-up rules', () => {
  const xpSource = script.match(/const xpNeed = l => [^;]+;/)[0];
  const c = context(`${xpSource}\n${fnSource('grantCoinSoulLevel')}`);
  const run = { xp: 12, xpNeed: 100, level: 8, pendingLv: 0, pendingFate: 0 };
  c.grantCoinSoulLevel(run);
  assert.deepEqual(JSON.parse(JSON.stringify(run)), { xp: 0, xpNeed: 109, level: 9, pendingLv: 1, pendingFate: 1 });
});

test('Skull calls the normal game-over flow', () => {
  let ref;
  const c = context(fnSource('resolveCoinFlip'), {
    G: { wave: 10 }, state: 'coin', BOT: { on: false },
    $: () => ({ classList: { add() {}, remove() {} } }), hide: () => {},
    setTimeout: fn => fn(), gameOver: () => { ref.state = 'over'; },
  });
  ref = c;
  c.resolveCoinFlip('skull');
  assert.equal(c.state, 'over');
});

test('Burning area damages enemies and expires at eight seconds', () => {
  const c = context(fnSource('tickCoinBurn'));
  const area = { x: 0, y: 0, r: 100, t: 8, tick: 0, dps: 90 };
  const enemy = { on: true, x: 15, y: 10, r: 10 };
  let damage = 0, alive = true;
  for (let i = 0; i < 20; i++) alive = c.tickCoinBurn(area, .4, [enemy], (_e, d) => damage += d);
  assert.ok(damage > 0, `Expected positive damage, got ${damage}`);
  assert.equal(alive, false);
  assert.equal(area.t <= 0, true);
});

test('A version 33 JSON save loads with defaults for all forge fields', () => {
  const metaStart = script.indexOf('const META = {');
  const metaOpen = script.indexOf('{', metaStart);
  let depth = 0, metaEnd = -1;
  for (let i = metaOpen; i < script.length; i++) { if (script[i] === '{') depth++; else if (script[i] === '}' && --depth === 0) { metaEnd = i + 1; break; } }
  assert.ok(metaEnd > 0);
  const metaDecl = script.slice(metaStart, metaEnd).replace(/^const META/, 'const META');
  const c = context(`${metaDecl}\n${fnSource('readAny')}`, {
    clamp: (x, a, b) => Math.max(a, Math.min(b, x)), migrateMeta: m => m, cleanIce: () => ({}), cleanHeroes: () => ({}), cleanKoop: () => ({}),
  });
  const loaded = c.readAny(JSON.stringify({ version: 33, runen: 120, runenschmiede: { hp: 2 }, rekord: { wave: 8, kills: 15, god: 'donar' } }));
  assert.equal(loaded.runes, 120);
  assert.equal(loaded.up.hp, 2);
  assert.equal(loaded.up.dmg, 0);
  assert.equal(loaded.best.wave, 8);
});

console.log(`${passed}/${passed} headless tests passed`);
