// Dependency-free Chromium smoke test. Servers, browser and profile are test-owned.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve, join, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const routes=JSON.parse(await readFile(join(root,'vercel.json'),'utf8')).rewrites;
const profile=await mkdtemp(join(tmpdir(),'naves-browser-'));
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://test').pathname;
  const target=routes.find(route=>route.source===path)?.destination??path;
  if(!(/^\/(?:assets\/[^.][\w./-]+|[\w-]+\.html|favicon\.svg)$/.test(target)) || target.includes('..')){res.writeHead(404).end();return;}
  try {const data=await readFile(join(root,target));res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(target)]??'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser,ws;
const errors=[];
try {
  browser=spawn(process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--user-data-dir=${profile}`,'--remote-debugging-port=0','--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore',windowsHide:true});
  let spawnError;browser.on('error',error=>{spawnError=error;});
  let port;
  for(let tries=0;tries<100;tries++) {if(spawnError)throw spawnError;try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await new Promise(done=>setTimeout(done,100));}}
  assert.ok(port,'Chromium did not expose its debugging port');
  const tab=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT',signal:AbortSignal.timeout(5000)})).json();
  ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((done,reject)=>{ws.onopen=done;ws.onerror=reject;});
  let id=0;const pending=new Map();
  ws.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const item=pending.get(data.id);pending.delete(data.id);data.error?item.reject(new Error(JSON.stringify(data.error))):item.resolve(data.result);}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.text);};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(new Error(`CDP timeout: ${method}`));},8000);pending.set(key,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id:key,method,params}));});
  await call('Runtime.enable');await call('Page.enable');
  const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value;};
  async function navigate(path){
    // Use a fresh query to force a document load even between fragments of one route.
    const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.removeEventListener('message',listener);reject(new Error(`Load timeout: ${path}`));},8000);const listener=event=>{if(JSON.parse(event.data).method==='Page.loadEventFired'){clearTimeout(timer);ws.removeEventListener('message',listener);resolve();}};ws.addEventListener('message',listener);});
    const url=new URL(origin+path);url.searchParams.set('check',String(++id));
    await call('Page.navigate',{url:url.href});await loaded;await evaluate('document.fonts.ready.then(()=>true)');
  }
  const setInput=(value)=>evaluate(`document.querySelector('#person-search').value=${JSON.stringify(value)};document.querySelector('#person-search').dispatchEvent(new Event('input'));`);
  console.log('Checking family interactions');
  await navigate('/');
  assert.equal(await evaluate(`document.querySelectorAll('.atlas-node').length`),6);
  await evaluate(`document.querySelector('.atlas-node[href="/arvore#gilmar"]').focus()`);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  for(let n=0;n<40;n++){if(await evaluate(`location.pathname==='/arvore' && location.hash==='#gilmar' && document.readyState==='complete'`))break;await new Promise(done=>setTimeout(done,50));}
  assert.ok(await evaluate(`location.pathname==='/arvore' && location.hash==='#gilmar'`),'Diagram keyboard navigation');
  await navigate('/arvore');
  assert.equal(await evaluate('window.NAVES_CHART.people.filter(p=>p.generation===1).length'),2);
  assert.ok(await evaluate('window.NAVES_CHART.people.length>100'));
  assert.deepEqual(await evaluate(`window.NAVES_FAMILY.reduce((totals,branch)=>{const visit=(p,depth)=>{totals[depth]++;p.children.forEach(c=>visit(c,depth+1))};branch.children.forEach(p=>visit(p,0));return totals},[0,0,0])`),[15,30,4]);
  assert.ok(await evaluate(`window.NAVES_CHART.relationships.every(e=>window.NAVES_CHART.people.some(p=>p.id===e.from)&&window.NAVES_CHART.people.some(p=>p.id===e.to))`));
  assert.ok(await evaluate(`window.NAVES_CHART.relationships.every(e=>{const p=window.NAVES_CHART.people;const from=p.find(p=>p.id===e.from),to=p.find(p=>p.id===e.to);return e.type==='parent'?to.generation===from.generation+1:to.generation===from.generation})`),'Parent links advance one generation; couples share a generation');
  assert.ok(await evaluate(`(()=>{const p=window.NAVES_CHART.people;const purcina=p.find(p=>p.name==='Purcina Maria de Jesus');return window.NAVES_CHART.relationships.filter(e=>e.type==='parent'&&e.from===purcina.id).length===4})()`),'Messias and Purcina’s four children are included');
  assert.ok(await evaluate(`(()=>{const {people,relationships}=window.NAVES_CHART;const edge=(child,parent)=>relationships.some(e=>e.type==='parent'&&e.from===people.find(p=>p.path===parent)?.id&&e.to===people.find(p=>p.path===child)?.id);return edge('neuza/Ossualdo Júnior/Mayk/Bento','neuza/Ossualdo Júnior/Mayk')&&edge('nilza/Viviane/Laura','nilza/Viviane')&&edge('nilda/Waleska/Mariana','nilda/Waleska')})()`));
  assert.ok(await evaluate(`(()=>{const {people,relationships}=window.NAVES_CHART;const fabio=people.find(p=>p.path==='gilmar/Fábio');const zelia=people.find(p=>p.name==='Zélia');return !relationships.some(e=>e.type==='parent'&&e.from===zelia.id&&e.to===fabio.id)})()`),'Current spouse is not assumed to be every child’s mother');
  assert.ok(await evaluate(`document.querySelectorAll('.genealogy-edge.partner').length>10`));
  assert.ok(await evaluate(`document.querySelectorAll('.genealogy-person.uncertain').length>0`));
  await setInput('antonio');assert.ok(await evaluate(`document.querySelectorAll('.genealogy-person.match').length>=2`));
  await setInput('not-a-family-name');assert.equal(await evaluate(`document.querySelector('#empty').hidden`),false);
  await evaluate(`document.querySelector('#tree-search').reset()`);assert.equal(await evaluate(`document.querySelector('#empty').hidden`),true);
  await evaluate(`document.querySelector('#branch-filter').value='nilza';document.querySelector('#branch-filter').dispatchEvent(new Event('change'))`);
  assert.ok(await evaluate(`[...document.querySelectorAll('.genealogy-person')].every(node=>{const p=window.NAVES_CHART.people.find(p=>p.id===node.dataset.person);return p.generation<=9||p.branch==='nilza'})`));
  await navigate('/arvore#gilmar');assert.equal(await evaluate(`document.querySelector('#branch-filter').value`),'gilmar');
  await evaluate(`document.querySelector('#zoom-in').click()`);assert.equal(await evaluate(`document.querySelector('#zoom-level').textContent`),'98%');
  await evaluate(`document.querySelector('#fit-tree').click()`);
  assert.ok(await evaluate(`document.querySelector('.genealogy-canvas').getBoundingClientRect().width<=document.querySelector('#tree-viewport').clientWidth+1`));
  await evaluate(`document.querySelector('#center-anesia').click()`);assert.ok(await evaluate(`document.querySelector('#person-inspector').textContent.includes('Anésia')`));
  await evaluate(`document.querySelector('[data-theme-toggle]').click()`);const theme=await evaluate(`document.documentElement.dataset.theme`);
  await navigate('/');assert.equal(await evaluate(`document.documentElement.dataset.theme`),theme);
  console.log('Checking responsive routes');
  for(const appearance of ['light','dark']) {
  await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(appearance)};localStorage.setItem('naves-atlas-theme',${JSON.stringify(appearance)})`);
  for(const width of [320,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const path of ['/','/arvore','/linhagem','/mapa']) {await navigate(path);assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),`${path}: overflow at ${width}`);assert.ok(await evaluate(`![...document.styleSheets].some(sheet=>['/assets/teo/','/assets/archive.css','/assets/site.css'].some(path=>(sheet.href||'').includes(path)))`),'No shared-system stylesheets');}
  }
  }
  await navigate('/linhagem');assert.equal(await evaluate(`document.querySelectorAll('.gen-section').length`),11);assert.ok(await evaluate(`document.querySelector('#g8').textContent.includes('1944')`));
  await evaluate(`document.querySelector('a[href="#g8"]').click()`);assert.equal(await evaluate(`location.hash`),'#g8');
  await navigate('/mapa');await evaluate(`document.querySelectorAll('.tl-item')[7].click()`);assert.ok(await evaluate(`document.querySelectorAll('.tl-item')[7].classList.contains('active')`));
  assert.deepEqual(errors,[],'Uncaught browser errors');
  if(process.env.SCREENSHOT_DIR){
    for(const [width,appearance,path,name] of [[1440,'light','/','atlas-home'],[1440,'light','/arvore','atlas-family'],[390,'light','/','atlas-mobile'],[390,'light','/arvore','atlas-family-mobile'],[1440,'dark','/','atlas-dark']]){
      await evaluate(`localStorage.setItem('naves-atlas-theme',${JSON.stringify(appearance)})`);
      await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate(path);
      const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.SCREENSHOT_DIR,`${name}.png`),Buffer.from(shot.data,'base64'));
    }
    await evaluate(`localStorage.setItem('naves-atlas-theme','light')`);
    await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('/arvore#neuza');
    await evaluate(`document.querySelector('#tree-viewport').scrollIntoView({block:'center',behavior:'instant'})`);
    let shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.SCREENSHOT_DIR,'genealogy-neuza.png'),Buffer.from(shot.data,'base64'));
    await evaluate(`document.querySelector('#fit-tree').click()`);
    shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.SCREENSHOT_DIR,'genealogy-overview.png'),Buffer.from(shot.data,'base64'));
  }
  console.log('PASS: full 13-generation chart; source/relationship integrity; 15/30/4 named modern descendants; explicit parentage; zoom/overview; search/reset/filter; keyboard diagram navigation; direct links; themes; historical/map controls; 320/768/1440px reflow; no runtime exceptions.');
  await call('Browser.close');
} finally {
  ws?.close();
  if(browser && browser.exitCode===null){browser.kill();await new Promise(done=>{browser.once('exit',done);setTimeout(done,3000);});}
  server.closeAllConnections();
  await new Promise(done=>server.close(done));
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});
}
