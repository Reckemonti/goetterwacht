// Version 38: Koop-Modus zu zweit an einem Gerät (WASD + Pfeile, oder linke/rechte Bildhälfte).
// Aufruf: node werkzeuge/gw38-headless.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'quelle-claude-artifact.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script, { filename: 'goetterwacht_v38.inline.js' });
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

const coopCore = [line(/const PK = [^\n]+/), line(/const COOP = [^\n]+/), line(/const REV_R = [^\n]+/), fnSource('swapP'), line(/const PL1 = [^\n]+/),
  fnSource('eachP'), fnSource('allP'), fnSource('ctr'), fnSource('nearP'), fnSource('levelTurn'), fnSource('tether'), fnSource('reviveUpdate'),
  'Object.assign(globalThis, { PK, COOP, REV_R, REV_T, swapP, PL1, PL2, eachP, allP, ctr, nearP, levelTurn, tether, reviveUpdate, setG:g=>{ G=g; } });'].join('\n');
const stubs = () => ({ G: null, state: 'play', VW: 1280, VH: 800, ZOOM: 1.15, CZMIN: .62, BOT: { on: true }, GODS: { donar: { name: 'Donar' }, skadi: { name: 'Skadi' } },
  particle() {}, burst() {}, sfx() {}, banner() {}, rnd: (a, b) => (a + b) / 2, PIDX: { gold: 2 } });
const player = (pid, extra = {}) => { const p = {}; for (const k of context(coopCore, stubs()).PK) p[k] = 0; return Object.assign(p, { pid, god: pid ? 'skadi' : 'donar', x: pid ? 40 : -40, y: 0, hp: 100, maxHp: 100, down: false, revT: 0, weapons: {}, buffs: {} }, extra); };

test('Version 38, Koop button is open in the main menu', () => {
  assert.match(html, /const GAME_VERSION = 38;/);
  assert.match(html, /id="ver">Version 38<\/div>/);
  assert.match(html, /id="credit">Made by a Legend NMO<\/div>/);
  assert.match(html, /<button class="btn big" id="btn-koop" type="button" title="Zu zweit an einem Gerät">Spiel starten · Koop<\/button>/);
  assert.doesNotMatch(html, /id="btn-koop"[^>]*disabled/);
  assert.match(script, /\$\("btn-koop"\)\.addEventListener\("click", \(\)=>\{ audioInit\(\); koop=true; openWorlds\(\); \}\);/);
  assert.match(html, /id="hp2" hidden/);
});

test('swapP exchanges every per-player field, shared fields stay', () => {
  const c = context(coopCore, stubs());
  const p1 = player(0, { weapons: { smash: { lvl: 2 } } }), p2 = player(1, { weapons: { thrust: { lvl: 1 } } });
  const G = Object.assign({}, p1, { wave: 7, kills: 300, level: 9, xp: 4, coop: true, p2 });
  c.setG(G); c.swapP();
  assert.equal(G.god, 'skadi'); assert.equal(G.pid, 1); assert.ok(G.weapons.thrust); assert.equal(G.p2.god, 'donar');
  assert.equal(G.wave, 7); assert.equal(G.kills, 300); assert.equal(G.level, 9);
  assert.equal(c.PL1().god, 'donar'); assert.equal(c.PL2().god, 'skadi');
  c.swapP(); assert.equal(G.god, 'donar'); assert.equal(G.pid, 0);
  for (const k of ['x', 'y', 'hp', 'maxHp', 'weapons', 'passives', 'fate', 'buffs', 'revives', 'rerolls', 'hl', 'down', 'vidar', 'ravens', 'pack']) assert.ok(c.PK.includes(k), k);
  for (const k of ['wave', 'kills', 'level', 'xp', 'runes', 'pendingLv', 'phase']) assert.ok(!c.PK.includes(k), k);
});

test('Solo stays solo: eachP and allP run once, ctr is the player', () => {
  const c = context(coopCore, stubs()); const G = player(0, { coop: false }); c.setG(G);
  let n = 0; c.eachP(() => n++); c.allP(() => n++); assert.equal(n, 2);
  assert.equal(c.ctr(), G); assert.equal(c.nearP(500, 500), G);
});

test('Coop: enemies and effects reach both standing players, not a fallen one', () => {
  const c = context(coopCore, stubs());
  const G = Object.assign(player(0, { x: -100 }), { coop: true, p2: player(1, { x: 300 }) }); c.setG(G);
  const seen = []; c.eachP(() => seen.push(G.god)); assert.deepEqual(seen, ['donar', 'skadi']); assert.equal(G.god, 'donar');
  assert.deepEqual(JSON.parse(JSON.stringify(c.ctr())), { x: 100, y: 0 });
  assert.equal(c.nearP(250, 0).god, 'skadi');
  G.p2.down = true; seen.length = 0; c.eachP(() => seen.push(G.god)); assert.deepEqual(seen, ['donar']);
  assert.equal(c.nearP(250, 0).god, 'donar', 'a fallen player does not collect');
  const all = []; c.allP(() => all.push(G.god)); assert.deepEqual(all, ['donar', 'skadi'], 'fate and clover reach both');
});

test('Level-up cards: player 1 first, then player 2; fallen players are skipped', () => {
  const c = context(coopCore, stubs());
  const G = Object.assign(player(0), { coop: true, lvTurn: 0, pendingLv: 2, chest: false, p2: player(1) }); c.setG(G);
  assert.equal(c.levelTurn(), true); assert.equal(G.god, 'donar');
  G.lvTurn = 1; assert.equal(c.levelTurn(), true); assert.equal(G.god, 'skadi', 'swapped to player 2 for the choice');
  c.swapP(); G.lvTurn = 0; G.p2.down = true; assert.equal(c.levelTurn(), true); assert.equal(G.god, 'donar');
  G.lvTurn = 1; assert.equal(c.levelTurn(), false); assert.equal(G.pendingLv, 1); assert.equal(G.lvTurn, 0);
  const ch = fnSource('choose');
  assert.match(ch, /if\(G\.coop && G\.lvTurn===0\) G\.lvTurn=1;/);
  assert.match(ch, /if\(G\.coop\)\{ G\.lvTurn=0; if\(G\.pid===1\) swapP\(\); renderSlots\(\); \} G\.pendingLv--;/);
  assert.match(fnSource('openLevel'), /if\(G\.coop && !levelTurn\(\)\) return;/);
});

test('Revive: stand 3 seconds next to the fallen player; far away does not count', () => {
  const c = context(coopCore, stubs());
  const G = Object.assign(player(0), { coop: true, p2: player(1, { down: true, hp: 0, x: 400 }) }); c.setG(G);
  for (let i = 0; i < 240; i++) c.reviveUpdate(1 / 60); assert.equal(G.p2.down, true, 'too far');
  G.p2.x = G.x + 30; for (let i = 0; i < 170; i++) c.reviveUpdate(1 / 60); assert.equal(G.p2.down, true, 'not yet 3 s');
  for (let i = 0; i < 20; i++) c.reviveUpdate(1 / 60);
  assert.equal(G.p2.down, false); assert.equal(G.p2.hp, 40); assert.ok(G.p2.inv > 0);
  assert.equal(c.REV_T, 3);
  const pd = fnSource('playerDown'); assert.match(pd, /if\(G\.p2\.down\)\{ gameOver\(\); return; \}/);
  assert.match(fnSource('hitPlayer'), /else if\(G\.coop\) playerDown\(\); else gameOver\(\);/);
  assert.match(fnSource('hitPlayer'), /G\.inv>0 \|\| state!=="play" \|\| G\.down/);
});

test('Tether keeps both on screen; a fallen player stays where they fell', () => {
  const c = context(coopCore, stubs());
  const G = Object.assign(player(0, { x: -2000 }), { coop: true, p2: player(1, { x: 2000 }) }); c.setG(G);
  c.tether(); const lim = 1280 / (1.15 * .62) - 220; assert.ok(Math.abs(G.p2.x - G.x - lim) < 1e-6); assert.ok(Math.abs(G.x + G.p2.x) < 1e-6);
  G.p2.down = true; G.p2.x = 3000; G.x = 0; c.tether(); assert.equal(G.p2.x, 3000); assert.ok(Math.abs(G.p2.x - G.x - lim) < 1e-6);
});

test('Two players: more and tougher enemies, enemies chase the nearer player', () => {
  const c = context(coopCore, stubs());
  assert.ok(c.COOP.hp > 1 && c.COOP.boss > 1 && c.COOP.cap > 1 && c.COOP.rate > 1 && c.COOP.xp > 1);
  assert.match(fnSource('spawnEnemy'), /if\(G\.coop\)\{ const m=e\.boss\?COOP\.boss:COOP\.hp; e\.hp\*=m; e\.maxHp\*=m; \}/);
  const sp = fnSource('spawner'); assert.match(sp, /\(G\.coop\?COOP\.cap:1\)/); assert.match(sp, /\(G\.coop\?COOP\.rate:1\)/);
  assert.match(fnSource('gainXp'), /\/\(G\.coop\?COOP\.xp:1\)/);
  const cu = fnSource('coopUpdate'); assert.match(cu, /e\.tg = G\.down\?1 : o\.down\?0 :/);
  assert.match(fnSource('enemiesUpdate'), /if\(G\.coop && e\.tg!==G\.pid\) continue;/);
  for (const w of ['projUpdate', 'spiralsUpdate']) assert.match(fnSource(w), /G\.coop&&\w\.own!==G\.pid/, w);
});

test('Solo path unchanged: same update order, same input', () => {
  const up = fnSource('update');
  assert.match(up, /if\(G\.coop\) coopUpdate\(dt\);\s+else \{\s+playerUpdate\(dt\);\s+worldUpdate\(dt\);\s+spawner\(dt\);\s+enemiesUpdate\(dt\);\s+weaponsUpdate\(dt\);\s+projUpdate\(dt\);\s+spiralsUpdate\(dt\);\s+stormsUpdate\(dt\);\s+skillsUpdate\(dt\);\s+iceUpdate\(dt\);\s+icewavesUpdate\(dt\);\s+pickupsUpdate\(dt\);/);
  const pu = fnSource('playerUpdate');
  assert.match(pu, /if\(kp<0\)\{ if\(keys\.ArrowLeft\|\|keys\.KeyA\) mx-=1;/);
  assert.match(pu, /else if\(kp===0\)\{ if\(keys\.KeyA\) mx-=1;/); assert.match(pu, /else \{ if\(keys\.ArrowLeft\) mx-=1;/);
  assert.match(pu, /const J=kp===1\?joy2:joy;/);
  assert.match(script, /const J=\(G&&G\.coop&&e\.clientX>VW\/2\)\?joy2:joy;/);
  assert.match(fnSource('render'), /const Z=ZOOM\*CZ\*\(1\+kick\*\.06\);/);
});

test('Menu: world, then player 1 and player 2 pick a god (same god allowed)', () => {
  const ps = fnSource('pickStart');
  assert.match(ps, /if\(!koop\)\{ startGame\(id\); return; \}/);
  assert.match(ps, /if\(koopStep===0\)\{ koopGod1=id; koopStep=1; heroSub\(\); return; \} startGame\(koopGod1, id\);/);
  assert.match(fnSource('startGame'), /newRun\(god, selWorld, god2\|\|null\)/);
  assert.match(fnSource('newRun'), /if\(god2\)\{ G\.coop=true; makeP2\(god2\); \}/);
  assert.match(fnSource('openHeroes'), /koopStep=0;/);
  assert.match(script, /\$\("btn-again"\)\.addEventListener\("click", \(\)=>startGame\(lastGod, lastGod2\)\);/);
});

test('Saves: Koop record is separate, old saves load without it', () => {
  const ck = context(line(/const cleanKoop = [^\n]+/) + '\nglobalThis.cleanKoop = cleanKoop;').cleanKoop;
  assert.deepEqual(JSON.parse(JSON.stringify(ck(undefined))), {});
  assert.deepEqual(JSON.parse(JSON.stringify(ck({ mittgard: { wave: '12', kills: 4000.7, gods: ['donar', 'skadi', 'x'] }, foo: { wave: 3 } }))), { mittgard: { wave: 12, kills: 4000, gods: ['donar', 'skadi'] } });
  assert.match(fnSource('saveJSON'), /seelen:meta\.souls\|\|0, helden:cleanHeroes\(meta\.heroLv\), koopRekord:cleanKoop\(meta\.bestKoop\)/);
  assert.match(fnSource('readAny'), /bestKoop:cleanKoop\(j\.koopRekord\|\|j\.bestKoop\)/);
  const go = fnSource('gameOver');
  assert.match(go, /if\(G\.coop\)\{ if\(waves>KB\.wave/); assert.match(go, /else if\(waves>B\.wave/);
  assert.match(go, /if\(!ice && !G\.coop\) submitScore/);
  assert.match(go, /meta\.runes \+= earned; const souls=soulsForRun\(G\.kills,waves\); meta\.souls=\(meta\.souls\|\|0\)\+souls;/);
});

console.log(`${passed}/11 headless tests passed`);
