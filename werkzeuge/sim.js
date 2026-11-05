// usage: node sim.js <version> <runsPerGod> <maxWave> [forgeJSON]
const {chromium}=require('playwright');
(async()=>{ const [V,N,MW,FJ,HU]=process.argv.slice(2); const forge=FJ&&FJ!=="-"?JSON.parse(FJ):null; const human=HU==="h";
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:800}}); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`file:///home/user/goetterwacht/Goetterwacht_v${V}.html`); await p.waitForTimeout(400);
const out=[];
for(const god of ['donar','ulfr','skadi']) for(let i=0;i<+N;i++){ const t0=Date.now(); const r=await p.evaluate(([g,mw,f,h])=>__gw.sim(g,{maxWave:mw,forge:f,human:h}),[god,+MW,forge,human]); r.sec=Math.round((Date.now()-t0)/1000); out.push(r); console.log(JSON.stringify(r)); }
const by={}; for(const r of out){ (by[r.god]=by[r.god]||[]).push(r.wavesDone); }
for(const g in by) console.log(g,'wavesDone avg',(by[g].reduce((a,b)=>a+b,0)/by[g].length).toFixed(1),'runs',by[g].join(','));
await b.close(); })();
