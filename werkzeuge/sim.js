// usage: node sim.js <html-file|-> <runsPerGod> <maxWave> [forgeJSON|-] [h|-] [ice: all|JSON|-]
// WORLD=eis plays Niflheim; PW_CHANNEL=msedge uses the installed Edge instead of the Playwright browser; '-' as file = ../index.html
const {chromium}=require('playwright');
(async()=>{ const [V,N,MW,FJ,HU,IJ]=process.argv.slice(2); const forge=FJ&&FJ!=="-"?JSON.parse(FJ):null; const human=HU==="h"; const ice=!IJ||IJ==="-"?null:IJ==="all"?"all":JSON.parse(IJ);
const b=await chromium.launch(process.env.PW_CHANNEL?{channel:process.env.PW_CHANNEL}:{}); const p=await b.newPage({viewport:{width:1280,height:800}}); p.on('pageerror',e=>console.log('ERR',e.message));
const file=/\.html$/.test(V)?require('path').resolve(V):require('path').join(__dirname,'..','index.html'); await p.goto('file:///'+file.replace(/\\/g,'/')); await p.waitForTimeout(400);
const out=[];
for(const god of ['donar','ulfr','skadi']) for(let i=0;i<+N;i++){ const t0=Date.now(); const r=await p.evaluate(([g,mw,f,h,i,wo])=>__gw.sim(g,{maxWave:mw,forge:f,human:h,ice:i,world:wo}),[god,+MW,forge,human,ice,process.env.WORLD||'mittgard']); r.sec=Math.round((Date.now()-t0)/1000); out.push(r); console.log(JSON.stringify(r)); }
const by={}; for(const r of out){ (by[r.god]=by[r.god]||[]).push(r.wavesDone); }
for(const g in by) console.log(g,'wavesDone avg',(by[g].reduce((a,b)=>a+b,0)/by[g].length).toFixed(1),'runs',by[g].join(','));
await b.close(); })();
