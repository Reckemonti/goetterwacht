// Test: laufende Runde speichern und fortsetzen (Solo)
// Aufruf: node werkzeuge/spielstand-runde.js index.html   (PW_CHANNEL=msedge, falls kein eigener Chromium da ist)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const ctx = await b.newContext({ viewport: { width: 1100, height: 700 } });
  const p = await ctx.newPage();
  let err = 0; p.on('pageerror', e => { err++; console.log('ERR', e.message); });
  const file = require('path').resolve(process.argv[2] || 'index.html');
  const url = 'file:///' + file.replace(/\\/g, '/');
  const ok = (n, c) => console.log((c ? 'OK  ' : 'FAIL') + ' ' + n);
  const W = ms => p.waitForTimeout(ms);
  const raw = () => p.evaluate(() => localStorage.getItem('gw-run-1'));
  const click = async sel => { await p.evaluate(s => document.querySelector(s).click(), sel); await W(150); };
  const toHeroes = async () => { await click('#btn-solo'); await click('[data-world=mittgard]'); };
  const pickHero = async id => { await click('[data-god=' + id + ']'); await click('#btn-start'); await W(250); };
  const hidden = id => p.evaluate(i => document.getElementById(i).hidden, id);
  const snap = () => p.evaluate(() => { const G = __gw.G; return JSON.stringify({ god: G.god, wave: G.wave, level: G.level, xp: Math.round(G.xp), kills: G.kills, runes: G.runes, hp: Math.round(G.hp), maxHp: G.maxHp, dmg: +G.dmgMul.toFixed(4), cd: +G.cdMul.toFixed(4), spd: +G.speed.toFixed(3), area: +G.area.toFixed(4), armor: +G.armor.toFixed(3), w: Object.values(G.weapons).map(w => w.id + w.lvl + (w.evo ? '*' : '')).sort(), p: Object.fromEntries(Object.entries(G.passives).sort()), fate: G.fate, rr: G.rerolls, rv: G.revives, x: Math.round(G.x), y: Math.round(G.y), pend: G.pendingLv }); });

  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await W(500);

  // 1) Runde bis Welle 5 hochziehen und speichern
  await toHeroes(); await pickHero('donar');
  ok('Spiel startet (kein Aufruf ohne Speicher)', await p.evaluate(() => __gw.state === 'play' && __gw.G.wave === 1));
  // Waffen und Passive ueber die echte Kartenwahl sammeln
  await p.evaluate(() => { __gw.meta.cardStop = true; __gw.meta.autoPick = false; });
  for (let i = 0; i < 9; i++) {
    await p.evaluate(() => { __gw.G.pendingLv = 1; }); await W(200);
    if (await p.evaluate(() => __gw.state === 'level')) { await p.evaluate(() => __gw.choose(0)); }
    await W(100);
  }
  await p.evaluate(() => {
    const G = __gw.G; G.wave = 5; G.wavesDone = 4; G.waveT = 33; G.phase = 'fight'; G.kills = 777; G.runes = 55; G.time = 321; G.rerolls = 2; G.x = 123; G.y = -77; G.fate.dmg = 1.12; G.dmgMul *= 1.12; G.level = 12; G.hp = Math.round(G.maxHp * .6); G.xp = 3;
  });
  await click('#pausebtn');
  const snapA = await snap(); const rawA = await raw();
  ok('Pause speichert unter gw-run-1', !!rawA && JSON.parse(rawA).wave === 5);
  ok('Speicher hat Version', JSON.parse(rawA).v === 1);
  console.log('   gespeichert:', JSON.parse(snapA).w.join(' '), '| Passive', JSON.stringify(JSON.parse(snapA).p));

  // 2) Neu laden: Held mit anderem Gott zeigt Hinweis auf Heldenseite
  await p.reload(); await W(500);
  ok('nach Neuladen ist Titel offen', await p.evaluate(() => __gw.state === 'title' || __gw.G === null));
  await toHeroes();
  ok('Heldenseite zeigt Fortfahren-Knopf', !(await hidden('run-box')) && (await p.textContent('#btn-run-box')).includes('Welle 5'));
  // anderer Held: Nachfrage mit Warnung
  await click('[data-god=skadi]'); await click('#btn-start');
  ok('anderer Held: Nachfrage', !(await hidden('ov-resume')) && (await p.textContent('#resume-info')).includes('andere Runde'));
  await click('#btn-run-back');
  ok('Zurueck: Heldenseite', !(await hidden('ov-heroes')) && (await raw()) !== null);

  // 3) Gleicher Held: Nachfrage, Fortfahren
  await pickHero('donar');
  ok('gleicher Held: Nachfrage', !(await hidden('ov-resume')));
  const goTxt = await p.textContent('#btn-run-go');
  ok('Knopftext "Fortfahren (Welle 5, Stufe N)"', /Fortfahren \(Welle 5, Stufe \d+\)/.test(goTxt));
  await click('#btn-run-go');
  ok('nach Fortfahren: Pause offen', await p.evaluate(() => __gw.state === 'pause') && !(await hidden('ov-pause')));
  const snapB = await snap();
  ok('Werte stimmen (Welle, Stufe, Waffen, Passive, Leben, Schicksal, Werte)', snapA === snapB);
  if (snapA !== snapB) { console.log(snapA); console.log(snapB); }
  await click('#btn-resume'); await W(2500);
  const run = await p.evaluate(() => ({ s: __gw.state, wave: __gw.G.wave, t: __gw.G.time, alive: __gw.alive(), fx: __gw.G.phase }));
  ok('Spiel laeuft weiter (Zeit, Gegner)', run.s === 'play' && run.t > 321 && run.alive > 0 && run.wave === 5);
  // bis zur naechsten Welle spielen lassen
  await p.evaluate(() => { __gw.G.waveT = 0.05; __gw.G.hp = __gw.G.maxHp; __gw.G.inv = 999; });
  await W(1500);
  const bossPhase = await p.evaluate(() => __gw.G.phase);
  ok('Welle laeuft zum Boss weiter', bossPhase === 'boss');

  // 4) Boss-Phase speichern -> Fortsetzen beginnt mit Kampf, Boss kommt gleich
  await click('#pausebtn');
  const rb = JSON.parse(await raw());
  ok('Bossphase wird als Kampf gespeichert', rb.phase === 'fight' && rb.waveT < 5);

  // 5) Neues Spiel loescht den Stand
  await p.reload(); await W(500);
  await toHeroes(); await pickHero('donar');
  await click('#btn-run-new');
  ok('Neues Spiel: Welle 1, Speicher geloescht', await p.evaluate(() => __gw.state === 'play' && __gw.G.wave === 1) && (await raw()) === null);

  // 6) Spielende loescht den Stand
  await click('#pausebtn');
  ok('Pause speichert wieder', (await raw()) !== null);
  await click('#btn-quit'); await W(400);
  ok('Game over loescht Speicher', (await raw()) === null);
  await click('#btn-menu');

  // 7) Unbekannte Version / kaputt wird ignoriert
  await p.evaluate(() => localStorage.setItem('gw-run-1', JSON.stringify({ v: 99, god: 'donar', world: 'mittgard', wave: 3, weapons: [{ id: 'smash', lvl: 1 }] })));
  await toHeroes();
  ok('fremde Version: kein Knopf', await hidden('run-box'));
  await pickHero('donar');
  ok('fremde Version: Spiel startet direkt', await p.evaluate(() => __gw.state === 'play' && __gw.G.wave === 1));
  await p.evaluate(() => localStorage.setItem('gw-run-1', '{kaputt'));
  await click('#pausebtn'); await click('#btn-quit'); await W(300); await click('#btn-menu');
  await p.evaluate(() => localStorage.setItem('gw-run-1', '{kaputt'));
  await toHeroes(); await pickHero('donar');
  ok('kaputter Speicher: Spiel startet direkt', await p.evaluate(() => __gw.state === 'play'));

  // 8) Koop beruehrt den Speicher nicht
  await p.evaluate(() => { __gw.meta.cardStop = false; });
  await click('#pausebtn'); await click('#btn-quit'); await W(300); await click('#btn-menu');
  await toHeroes(); await pickHero('donar'); await click('#pausebtn');
  const keep = await raw(); await click('#btn-quit'); await W(300);
  await p.evaluate(() => localStorage.setItem('gw-run-1', '{"x":1}'));
  await click('#btn-menu'); await click('#btn-koop'); await click('#btn-koop-local'); await click('[data-world=mittgard]'); await click('[data-god=ulfr]'); await click('#btn-start'); await click('[data-god=skadi]'); await click('#btn-start'); await W(600);
  const kp = await p.evaluate(() => __gw.state === 'play' && __gw.G.coop);
  await click('#pausebtn'); await W(100);
  ok('Koop startet ohne Nachfrage', kp);
  ok('Koop speichert nicht', (await raw()) === '{"x":1}');

  ok('keine Fehler', err === 0);
  await b.close();
})();
