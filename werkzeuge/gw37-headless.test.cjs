// Version 37 (GW-6): Helden einzeln in der Ruhmeshalle leveln, bezahlt mit Seelen, sichtbar mächtiger bei 1/4/7/10.
// Aufruf: node werkzeuge/gw37-headless.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'quelle-claude-artifact.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script, { filename: 'goetterwacht_v37.inline.js' });
function block(start, open = '{', close = '}') {
  const s = script.indexOf(start); assert.notEqual(s, -1, `Missing ${start}`);
  const o = script.indexOf(open, s); let depth = 0, quote = '', esc = false;
  for (let i = o; i < script.length; i++) {
    const ch = script[i];
    if (quote) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === open) depth++;
    if (ch === close && --depth === 0) return script.slice(s, i + 1) + ';';
  }
  throw new Error(`Unclosed ${start}`);
}
const fnSource = name => block(`function ${name}(`);
const line = re => { const m = script.match(re); assert.ok(m, `Missing ${re}`); return m[0]; };
function context(source, extras = {}) { const c = { ...extras }; vm.createContext(c); vm.runInContext(source, c); return c; }
let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }

const GODS = 'const GODS = { donar:{}, ulfr:{}, skadi:{} };';
const heroData = [GODS, line(/const HERO_MAX = [^\n]+/), block('const HERO = {'), line(/const HERO_STAGE = [^\n]+/), line(/const heroStage = [^\n]+/),
  line(/const heroCost = [^\n]+/), line(/const cleanHeroes = [^\n]+/), line(/const heroLv = [^\n]+/), line(/const soulsForRun = [^\n]+/), fnSource('buyHero'),
  'Object.assign(globalThis, { HERO_MAX, HERO, HERO_STAGE, heroStage, heroCost, cleanHeroes, heroLv, soulsForRun });'].join('\n');

test('Version 37 with credit', () => {
  assert.match(html, /const GAME_VERSION = (3[7-9]|[4-9]\d);/);
  assert.match(html, /id="ver">Version (3[7-9]|[4-9]\d)<\/div>/);
  assert.match(html, /id="credit">Made by a Legend NMO<\/div>/);
});

test('Level cap 10, visible stages at 1, 4, 7, 10, rising soul costs', () => {
  const c = context(heroData, { meta: {}, saveMeta: () => {} });
  assert.equal(c.HERO_MAX, 10);
  const st = [...Array(11).keys()].map(c.heroStage);
  assert.deepEqual(st, [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
  assert.equal(c.HERO_STAGE.length, 5);
  for (let l = 1; l < 10; l++) assert.ok(c.heroCost(l) > c.heroCost(l - 1));
  for (const id of ['donar', 'ulfr', 'skadi']) { const h = c.HERO[id]; assert.ok(h.hp > 0 && h.dmg > 0 && h.spd > 0 && h.sp, id); }
});

test('Each hero levels on its own and pays with souls', () => {
  const meta = { souls: 100, heroLv: {} };
  const c = context(heroData, { meta, saveMeta: () => {} });
  assert.equal(c.buyHero('ulfr'), true);
  assert.equal(meta.souls, 60); assert.equal(c.heroLv('ulfr'), 1); assert.equal(c.heroLv('donar'), 0);
  assert.equal(c.buyHero('ulfr'), false, 'next step costs 90');
  meta.souls = 1e6; for (let i = 0; i < 20; i++) c.buyHero('skadi');
  assert.equal(c.heroLv('skadi'), 10, 'capped at 10');
  assert.equal(c.buyHero('loki'), false);
});

test('Saves: old saves load with level 0, bad values are clamped', () => {
  const c = context(heroData, { meta: {} });
  assert.deepEqual(JSON.parse(JSON.stringify(c.cleanHeroes(undefined))), { donar: 0, ulfr: 0, skadi: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(c.cleanHeroes({ donar: 3, ulfr: 99, skadi: -2, loki: 5 }))), { donar: 3, ulfr: 10, skadi: 0 });
  assert.match(fnSource('saveJSON'), /seelen:meta\.souls\|\|0, helden:cleanHeroes\(meta\.heroLv\)/);
  assert.match(fnSource('readAny'), /heroLv:cleanHeroes\(j\.helden\|\|j\.heroLv\)/);
});

test('Souls per run and hero bonuses reach the run', () => {
  const c = context(heroData, { meta: {} });
  assert.equal(c.soulsForRun(0, 0), 0); assert.equal(c.soulsForRun(5000, 10), 70);
  assert.match(fnSource('gameOver'), /meta\.souls=\(meta\.souls\|\|0\)\+souls/);
  assert.match(fnSource('newRun'), /maxHp = Math\.round\(\(god\.hp \+ u\.hp\*4\)\*\(1\+hl\*HERO\[godId\]\.hp\)\)/);
  const ap = fnSource('applyPassives');
  assert.match(ap, /\(1\+\(G\.hl\|\|0\)\*HERO\[G\.god\]\.dmg\)/); assert.match(ap, /\(1\+\(G\.hl\|\|0\)\*HERO\[G\.god\]\.spd\)/);
});

test('Heldenhalle lives in the Ruhmeshalle, heroes drawn by stage', () => {
  assert.match(html, /id="hero-hall"/); assert.match(html, /id="souls-hall"/);
  assert.match(script, /\$\("btn-board"\)\.addEventListener\("click", \(\)=>\{ renderHall\(\);/);
  const spr = fnSource('heroSpr');
  for (const n of ['st>=2', 'st>=3', 'st>=4']) assert.ok(spr.includes(n), n);
  assert.match(script, /heroSpr\(G\.god,heroStage\(G\.hl\|\|0\)\)/);
});

console.log(`${passed}/6 headless tests passed`);
