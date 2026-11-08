// Online-Koop-Test (v39): zwei Browserfenster, Gastgeber (PC) und Gast (Handygrösse), verbunden über den Einladungslink.
// Aufruf: node werkzeuge/online-qa.js            -> Verbindung über BroadcastChannel (?netz=lokal, ohne Internet)
//         NETZ=echt node werkzeuge/online-qa.js  -> echte Verbindung über PeerJS/WebRTC (braucht Internet)
// PW_CHANNEL=msedge nimmt das installierte Edge.
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..'), REAL=process.env.NETZ==='echt';
const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html'); fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}); r.end(d); }); });
(async()=>{
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok)); const base=`http://127.0.0.1:${srv.address().port}/index.html`;
const b=await chromium.launch(process.env.PW_CHANNEL?{channel:process.env.PW_CHANNEL}:{}); const ctx=await b.newContext();
const h=await ctx.newPage(), g=await ctx.newPage(); await h.setViewportSize({width:1280,height:800}); await g.setViewportSize({width:390,height:844});
let err=0; for(const [n,p] of [['host',h],['guest',g]]) p.on('pageerror',e=>{ err++; console.log('ERR',n,e.message); });
const ok=(n,c)=>console.log((c?'OK  ':'FAIL')+' '+n), W=ms=>h.waitForTimeout(ms);
const until=async(p,fn,arg,ms=8000)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(await p.evaluate(fn,arg)) return true; await p.waitForTimeout(100); } return false; };
await h.goto(base+(REAL?'':'?netz=lokal')); await h.evaluate(()=>localStorage.clear()); await h.reload(); await W(500);
await h.click('#btn-koop'); ok('koop choice', !(await h.isHidden('#ov-koop'))); await h.click('#btn-koop-net'); await h.click('[data-world=mittgard]');
ok('host picks a god', (await h.textContent('#btn-start'))==='Einladung erstellen'); await h.click('[data-god=donar]'); await h.click('#btn-start');
ok('invitation link', await until(h,()=>/koop=[A-Z0-9]{6}/.test(document.getElementById('lobby-link').value),null,REAL?20000:4000));
const link=await h.inputValue('#lobby-link'), code=link.match(/koop=([A-Z0-9]+)/)[1]; console.log('     link', link);
await g.goto(`${base}?koop=${code}${REAL?'':'&netz=lokal'}`);
ok('guest sees god choice', await until(g,()=>!document.getElementById('ov-heroes').hidden,null,REAL?25000:5000));
ok('host god is blocked', await g.evaluate(()=>document.querySelector('[data-god=donar]').disabled)); ok('guest button', (await g.textContent('#btn-start'))==='Bereit');
await g.click('[data-god=skadi]'); await g.click('#btn-start'); ok('guest ready', (await g.textContent('#lobby-msg')).includes('Bereit'));
ok('host can start', await until(h,()=>!document.getElementById('btn-lobby-start').hidden)); await h.click('#btn-lobby-start');
ok('host runs coop', await until(h,()=>__gw.state==='play' && __gw.G.coop && __gw.PL2().god==='skadi' && __gw.PL1().god==='donar'));
ok('guest sees the game', await until(g,()=>__gw.state==='play' && __gw.G && __gw.G.p2.god==='skadi' && __gw.alive()>0));
await h.evaluate(()=>{ __gw.PL1().inv=99; __gw.PL2().inv=99; });
const x0=await h.evaluate(()=>__gw.PL2().x); await g.bringToFront(); await g.keyboard.down('KeyD');
ok('guest steers his god on the host', await until(h,x=>__gw.PL2().x-x>60,x0,6000)); await g.keyboard.up('KeyD');
ok('host enemies reach the guest', await until(g,()=>{ const n=__gw.alive(); return n>5; }));
await g.screenshot({path:'online_guest.png'}); await h.screenshot({path:'online_host.png'});
const live=p=>p.evaluate(()=>{ const o=document.getElementById('ov-level'); return !o.hidden && o.classList.contains('live'); });
const badge=p=>p.evaluate(()=>!document.getElementById('livebtn').hidden);
await h.evaluate(()=>{ __gw.G.pendingLv=1; });
ok('host gets a button, no cards in the way', await until(h,()=>!document.getElementById('livebtn').hidden && document.getElementById('ov-level').hidden && __gw.state==='play'));
ok('guest gets a button', await until(g,()=>!document.getElementById('livebtn').hidden && document.getElementById('ov-level').hidden));
const t0=await h.evaluate(()=>__gw.NET.live[0].t); await W(1200); ok('no timer while closed', (await h.evaluate(()=>__gw.NET.live[0].t))===t0);
await h.click('#livebtn'); ok('host opens his cards', await live(h)); ok('game runs while open', await h.evaluate(()=>__gw.state==='play'));
ok('host shielded while open', await h.evaluate(()=>__gw.PL1().inv>0));
await h.click('#btn-later'); ok('later closes, button back', !(await live(h)) && await until(h,()=>!document.getElementById('livebtn').hidden));
await h.click('#livebtn'); await h.click('#cards .card'); ok('host picked', !(await live(h)) && !(await h.evaluate(()=>__gw.NET.live[0])));
await g.click('#livebtn'); ok('guest opens his cards', await live(g)); ok('host knows guest is choosing', await until(h,()=>__gw.NET.live[1] && __gw.NET.live[1].open));
await g.click('#cards .card'); ok('guest picked', await until(h,()=>!__gw.NET.live[1])); ok('guest panel and button gone', await until(g,()=>document.getElementById('ov-level').hidden && document.getElementById('livebtn').hidden));
await h.evaluate(()=>{ __gw.G.pendingLv=2; }); ok('two levels: button shows count', await until(h,()=>document.getElementById('livebtn').textContent.includes('(2)')));
await h.click('#livebtn'); await h.evaluate(()=>{ __gw.NET.live[0].t=.05; }); ok('time up while open picks a card', await until(h,()=>!__gw.NET.live[0] || __gw.NET.live[0].t>1));
await h.evaluate(()=>{ __gw.NET.live=[null,null]; __gw.G.lvq=[0,0]; }); await until(g,()=>{ return true; });
// free movement: the guest walks far away, each device follows its own god
await h.evaluate(()=>{ __gw.PL1().inv=99; __gw.PL2().inv=99; __gw.PL2().speed=900; });
await g.bringToFront(); await g.keyboard.down('KeyD'); await g.waitForTimeout(3000); await g.keyboard.up('KeyD');
const dist=await h.evaluate(()=>Math.hypot(__gw.PL1().x-__gw.PL2().x, __gw.PL1().y-__gw.PL2().y)); console.log('     distance', Math.round(dist));
ok('players can walk apart (no leash)', dist>1500);
ok('guest camera follows guest', await until(g,()=>Math.abs(__gw.cam()[0]-__gw.G.p2.x)<200));
ok('host camera follows host', await h.evaluate(()=>Math.abs(__gw.cam()[0]-__gw.PL1().x)<200));
ok('guest sees enemies around himself', await until(g,()=>__gw.E.some(e=>e.on && Math.abs(e.x-__gw.G.p2.x)<900),null,8000));
await h.evaluate(()=>{ __gw.PL2().speed=200; }); await h.bringToFront();
await g.click('#pausebtn'); ok('guest pauses both', await until(h,()=>__gw.state==='pause')); ok('guest sees pause', await until(g,()=>!document.getElementById('ov-wait').hidden && !document.getElementById('btn-wait-resume').hidden));
await W(2500); ok('heartbeat while paused', await h.evaluate(()=>performance.now()-__gw.NET.seen<1600));
await g.click('#btn-wait-resume'); ok('guest resumes', await until(h,()=>__gw.state==='play'));
await h.evaluate(()=>__gw.down(1)); ok('guest god down', await until(g,()=>document.getElementById('hp2lv').textContent.includes('Boden')));
await h.evaluate(()=>{ const a=__gw.PL1(), b=__gw.PL2(); a.x=b.x+20; a.y=b.y; a.inv=99; }); ok('revived by host', await until(h,()=>!__gw.PL2().down,null,6000));
const r0=await g.evaluate(()=>__gw.meta.runes);
await h.evaluate(()=>{ __gw.G.runes=50; __gw.down(0); __gw.down(1); }); ok('host game over', await until(h,()=>__gw.state==='over'));
ok('guest game over', await until(g,()=>!document.getElementById('ov-over').hidden && document.getElementById('over-title').textContent.includes('Koop')));
ok('guest gets runes', (await g.evaluate(()=>__gw.meta.runes))>r0); ok('guest waits for host', await g.isDisabled('#btn-again'));
await h.click('#btn-again'); ok('new round for both', await until(g,()=>__gw.state==='play' && __gw.G && __gw.G.p2.god==='skadi'));
await g.click('#pausebtn'); await until(g,()=>!document.getElementById('ov-wait').hidden); await g.click('#btn-wait-leave');
ok('guest left', await until(g,()=>!document.getElementById('ov-title').hidden)); ok('host plays on alone', await until(h,()=>__gw.NET.lost && __gw.PL2().down));
console.log('errors',err); await b.close(); srv.close();
})();
