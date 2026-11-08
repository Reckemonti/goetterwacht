// Online-Koop-Test (v41): Spieler 1 ist kurz offline (wie Handy in WhatsApp), der Gast öffnet den Link in dieser Zeit.
// Erwartet: Einladung bleibt gültig, der Gast klopft weiter an und kommt rein, sobald Spieler 1 zurück ist.
// Aufruf: node werkzeuge/online-wieder.js   (braucht Internet, echte PeerJS-Verbindung; PW_CHANNEL=msedge nimmt Edge)
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=process.env.ROOT||path.join(__dirname,'..'), OFF=+(process.env.OFFLINE_S||25)*1000;
const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html'); fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}); r.end(d); }); });
(async()=>{
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok)); const base=`http://127.0.0.1:${srv.address().port}/index.html`;
const b=await chromium.launch(process.env.PW_CHANNEL?{channel:process.env.PW_CHANNEL}:{}); const hc=await b.newContext(), gc=await b.newContext();
const h=await hc.newPage(), g=await gc.newPage(); let err=0; for(const [n,p] of [['host',h],['guest',g]]) p.on('pageerror',e=>{ err++; console.log('ERR',n,e.message); });
const ok=(n,c)=>console.log((c?'OK  ':'FAIL')+' '+n);
const until=async(p,fn,arg,ms=8000)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(await p.evaluate(fn,arg)) return true; await p.waitForTimeout(200); } return false; };
await h.goto(base); await h.click('#btn-koop'); await h.click('#btn-koop-net'); await h.click('[data-world=mittgard]'); await h.click('[data-god=donar]'); await h.click('#btn-start');
ok('invitation link', await until(h,()=>/koop=[A-Z0-9]{6}/.test(document.getElementById('lobby-link').value),null,20000));
const code=(await h.inputValue('#lobby-link')).match(/koop=([A-Z0-9]+)/)[1];
await hc.setOffline(true); await h.evaluate(()=>{ try{ __gw.NET.peer.socket._socket.close(); }catch(e){} });   // Funkloch: Vermittler-Verbindung weg
ok('host lost the broker', await until(h,()=>__gw.NET.peer && __gw.NET.peer.disconnected,null,10000));
await g.goto(`${base}?koop=${code}`); await g.waitForTimeout(OFF);
ok('guest still waiting', await g.evaluate(()=>document.getElementById('lobby-msg').textContent.includes('Warte auf Spieler 1')));
ok('host invitation still open', await h.evaluate(()=>__gw.NET.host && !document.getElementById('lobby-linkrow').hidden));
await hc.setOffline(false); await h.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
ok('host back at the broker', await until(h,()=>__gw.NET.peer && !__gw.NET.peer.disconnected,null,20000));
ok('guest gets in', await until(g,()=>!document.getElementById('ov-heroes').hidden,null,30000));
await g.click('[data-god=skadi]'); await g.click('#btn-start'); ok('host can start', await until(h,()=>!document.getElementById('btn-lobby-start').hidden,null,8000));
await h.click('#btn-lobby-start'); ok('game runs for both', await until(g,()=>__gw.state==='play' && __gw.G && __gw.G.p2.god==='skadi',null,10000));
console.log('errors',err); await b.close(); srv.close();
})();
