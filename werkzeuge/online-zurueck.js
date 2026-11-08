// Online-Koop-Test (v45): der Gast verliert die Verbindung mitten in der Runde und steigt mit dem gleichen Link wieder ein.
// Aufruf: node werkzeuge/online-zurueck.js   (NETZ=echt für echte Verbindung über PeerJS/WebRTC, PW_CHANNEL=msedge nimmt Edge)
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
await h.evaluate(()=>{ __gw.PL2().weapons.thrust.lvl=4; __gw.G.wave=3; });
const url=`${base}?koop=${code}${REAL?'':'&netz=lokal'}`; await g.close(); console.log('     guest closed the page');
ok('host notices and plays on', await until(h,()=>__gw.NET.lost && __gw.PL2().down,null,40000));
const g2=await ctx.newPage(); await g2.setViewportSize({width:390,height:844}); g2.on('pageerror',e=>{ err++; console.log('ERR guest2',e.message); });
await g2.goto(url);
ok('guest is back in the same round', await until(g2,()=>__gw.G && __gw.G.coop && __gw.G.p2.god==='skadi' && __gw.G.wave>=3,null,REAL?40000:10000));
ok('host has the partner back', await until(h,()=>!__gw.NET.lost && !__gw.PL2().down));
if(await h.evaluate(()=>__gw.state==='pause')){ await h.bringToFront(); await h.click('#btn-resume'); }
ok('both play again', await until(g2,()=>__gw.state==='play'));
ok('guest keeps his weapons', await until(g2,()=>__gw.G && __gw.G.p2.weapons.thrust && __gw.G.p2.weapons.thrust.lvl===4));
const x0=await h.evaluate(()=>__gw.PL2().x); await g2.bringToFront(); await g2.keyboard.down('KeyD');
ok('guest steers again', await until(h,x=>__gw.PL2().x-x>60,x0,6000)); await g2.keyboard.up('KeyD');
console.log('errors',err); await b.close(); srv.close();
})();
