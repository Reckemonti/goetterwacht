// Version 36: Welten (Midgard, Niflheim ab Welle 20 frei), Pfad nach Niflheim, neue Gaben, Menü Solo/Welt/Held, mehr Schmiede-Stufen.
// Aufruf: node werkzeuge/gw36-headless.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'quelle-claude-artifact.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script, { filename: 'goetterwacht_v36.inline.js' });
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

const iceData = [line(/const WORLDS = \{/) && block('const WORLDS = {'), line(/const worldOpen = [^\n]+/), block('const ICE_SKILLS = [', '[', ']'),
  line(/const iceOwned = [^\n]+/), line(/const cleanIce = [^\n]+/),
  'Object.assign(globalThis, { WORLDS, worldOpen, ICE_SKILLS, iceOwned, cleanIce });'].join('\n');

test("Version 36 or later with credit", () => {
  const v = +html.match(/const GAME_VERSION = (\d+);/)[1];
  assert.ok(v >= 36);
  assert.match(html, new RegExp(`id="ver">Version ${v}<\\/div>`));
  assert.match(html, /id="credit">Made by a Legend NMO<\/div>/);
});

test('Niflheim is a world of its own, locked until wave 20 in Midgard', () => {
  const c = context(iceData, { meta: { best: { wave: 19 }, ach: {} } });
  assert.deepEqual(Object.keys(c.WORLDS), ['mittgard', 'eis']);
  assert.equal(c.worldOpen('mittgard'), true);
  assert.equal(c.worldOpen('eis'), false);
  c.meta.best.wave = 20; assert.equal(c.worldOpen('eis'), true);
  c.meta.best.wave = 3; c.meta.ach.w20 = 123; assert.equal(c.worldOpen('eis'), true, 'achievement unlocks too');
  assert.doesNotMatch(fnSource('waveUpdate'), /enterIce/, 'Midgard no longer turns into ice after wave 20');
  assert.match(fnSource('newRun'), /world==="eis"\?"eis":"mittgard"/);
  assert.match(fnSource('startGame'), /newRun\(god, selWorld[,)]/);
});

test('Menu flow: Solo/Koop, world choice, hero choice, Ragnarök starten', () => {
  for (const id of ['btn-solo', 'btn-koop', 'ov-worlds', 'ov-heroes', 'btn-start', 'btn-shop3', 'btn-heroes-worlds', 'btn-heroes-menu'])
    assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /id="btn-koop" type="button"/); // v38: Koop ist offen
  assert.match(html, />Ragnarök starten</);
  assert.match(script, /\$\("btn-menu"\)\.addEventListener\("click", (toHeroes\)|\(\)=>\{ if\(NET\.guest\|\|NET\.host\) netLeave\(\); else toHeroes\(\); \}\))/, 'after a run back to hero choice');
});

test('Snowstorms replace fog in Niflheim, Midgard events unchanged', () => {
  const c = context(fnSource('waveEvent'));
  const old = w => w % 7 === 0 ? 'blutmond' : (w >= 6 && w % 5 !== 0 && w % 4 === 2) ? 'nebel' : null;
  for (let w = 1; w <= 40; w++) assert.equal(c.waveEvent(w, false), old(w), `wave ${w}`);
  const ice = []; for (let w = 1; w <= 20; w++) { const e = c.waveEvent(w, true); assert.notEqual(e, 'nebel'); if (e === 'schneesturm') ice.push(w); }
  assert.ok(ice.length >= 5, `storms: ${ice}`);
  assert.equal(c.waveEvent(14, true), 'blutmond');
  assert.equal(c.waveEvent(10, true), null, 'no storm in big boss wave');
});

test('Forge: 10 more stages per stat upgrade once Niflheim is open', () => {
  const metaDecl = block('const META = {');
  const c = context(`${metaDecl}\n${iceData}\n${line(/const metaMax = [^\n]+/)}\nglobalThis.META=META; globalThis.metaMax=metaMax;`, { meta: { best: { wave: 5 }, ach: {} } });
  const ext = Object.keys(c.META).filter(k => c.META[k].ext);
  assert.equal(ext.length, 12);
  for (const k of ['reroll', 'start', 'revive']) assert.ok(!c.META[k].ext, k);
  assert.equal(c.metaMax('armor'), 10); assert.equal(c.metaMax('hp'), 20);
  c.meta.best.wave = 20;
  assert.equal(c.metaMax('armor'), 20); assert.equal(c.metaMax('hp'), 30); assert.equal(c.metaMax('revive'), 2);
  assert.match(fnSource('readAny'), /clamp\(v,0,META\[k\]\.max\+\(META\[k\]\.ext\|\|0\)\)/);
});

test('Ice skill tree: 10 unique skills, valid prerequisites, rising costs', () => {
  const c = context(iceData, { meta: {} });
  const S = c.ICE_SKILLS, ids = S.map(k => k.id);
  assert.equal(S.length, 10);
  assert.equal(new Set(ids).size, 10);
  for (const k of S) {
    assert.ok(k.name && k.d && k.rune && k.cost > 0, k.id);
    for (const n of k.need) { assert.ok(ids.includes(n), `${k.id} needs ${n}`); assert.ok(S.find(x => x.id === n).tier < k.tier); }
    if (k.tier > 1) assert.ok(k.need.length > 0, `${k.id} has a parent`);
  }
  assert.ok(S.filter(k => k.tier === 1).every(k => k.cost < S.find(x => x.tier === 4).cost));
});

test('Buying follows the tree and costs runes', () => {
  const meta = { runes: 2000, ice: {} };
  const c = context(`${iceData}\n${fnSource('buyIce')}`, { meta, saveMeta: () => {} });
  assert.equal(c.buyIce('glut'), false, 'needs Bärenfell first');
  assert.equal(c.buyIce('pelz'), true);
  assert.equal(meta.runes, 1700);
  assert.equal(c.buyIce('pelz'), false, 'not twice');
  assert.equal(c.buyIce('glut'), true);
  assert.equal(c.buyIce('funke'), false, 'too few runes');
  assert.deepEqual(JSON.parse(JSON.stringify(meta.ice)), { pelz: true, glut: true });
});

test('v34 save loads, v36 save keeps the ice path, unknown ids are dropped', () => {
  const metaDecl = block('const META = {');
  const c = context(`${metaDecl}\n${iceData}\n${fnSource('readAny')}`, {
    meta: {}, cleanHeroes: () => ({}), cleanKoop: () => ({}), clamp: (x, a, b) => Math.max(a, Math.min(b, x)), migrateMeta: m => m,
  });
  const v34 = { spiel: 'Götterwacht', format: 2, version: 34, runen: 500, runenschmiede: { hp: 3, revive: 1 }, rekord: { wave: 17, kills: 900, god: 'skadi' }, erfolge: { w5: 1 } };
  const a = c.readAny(JSON.stringify(v34));
  assert.equal(a.runes, 500); assert.equal(a.up.hp, 3); assert.equal(a.best.wave, 17);
  assert.deepEqual(JSON.parse(JSON.stringify(a.ice)), {});
  const b = c.readAny(JSON.stringify({ ...v34, version: 36, eispfad: { pelz: true, schuh: true, hack: true, glut: 'yes' } }));
  assert.deepEqual(JSON.parse(JSON.stringify(b.ice)), { pelz: true, schuh: true });
});

test('Save file writes the ice path', () => {
  assert.match(fnSource('saveJSON'), /eispfad:cleanIce\(meta\.ice\)/);
  assert.match(fnSource('applyLoaded'), /meta\.ice=cleanIce\(meta\.ice\)/);
});

test('New level-up choices: 2 weapons and 3 gifts, one more slot in the ice world', () => {
  for (const id of ['frostnova', 'eiszapfen']) assert.match(script, new RegExp(`\\n  ${id}:\\{ name:"[^"]+", rune:"[^"]+", max:10, ice:true,`));
  for (const id of ['zaeh', 'weisheit', 'scharf']) assert.match(script, new RegExp(`\\n  ${id}:\\{ name:"[^"]+", rune:"[^"]+", max:10, d:"`));
  const c = context(line(/const slotMax = [^\n]+/) + '\nglobalThis.slotMax = slotMax;', { G: { world: 'mittgard' } });
  assert.equal(c.slotMax(), 6); c.G.world = 'eis'; assert.equal(c.slotMax(), 7);
  const offers = fnSource('buildOffers');
  assert.match(offers, /nW<slotMax\(\)/); assert.match(offers, /nP<slotMax\(\)/);
  assert.match(fnSource('weaponsUpdate'), /id==="frostnova"/); assert.match(fnSource('weaponsUpdate'), /id==="eiszapfen"/);
});

test('Niflheim run: new map, frost enemies, wolves and saves', () => {
  assert.match(fnSource('enterIce'), /G\.world="eis"; if\(decorWorld!=="eis"\) genDecor\("eis"\)/);
  assert.match(fnSource('spawnEnemy'), /if\(G\.world==="eis"\)\{ e\.ice=true; e\.hp\*=ICE_HP; e\.maxHp\*=ICE_HP; e\.dmg\*=ICE_DMG; \}/);
  assert.match(fnSource('pickKind'), /return "golem"/);
  assert.match(script, /golem:\{ hp:110,/);
  assert.match(fnSource('saveJSON'), /rekordNiflheim:/);
  assert.match(fnSource('gameOver'), /if\(!ice( && !G\.coop)?\) submitScore/);
});

console.log(`${passed}/11 headless tests passed`);
