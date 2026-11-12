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
  const setInput=(value)=>evaluate(`document.querySelector('#family-search').value=${JSON.stringify(value)};document.querySelector('#family-search').dispatchEvent(new Event('input'));`);
  console.log('Checking family interactions');
  await navigate('/');
  assert.equal(await evaluate(`document.querySelectorAll('.generation-spine a').length`),13);
  assert.ok(await evaluate(`!document.querySelector('#fontes')&&!document.querySelector('.gathering .source-line')`),'Annotated homepage sections removed');
  assert.equal(await evaluate(`document.querySelectorAll('.era-links a').length`),4);
  await evaluate(`document.querySelector('.generation-spine a[href="/arvore#generation-11"]').focus()`);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  for(let n=0;n<40;n++){if(await evaluate(`location.pathname==='/arvore' && location.hash==='#generation-11' && document.readyState==='complete'`))break;await new Promise(done=>setTimeout(done,50));}
  assert.ok(await evaluate(`location.pathname==='/arvore' && location.hash==='#generation-11'`),'Generation keyboard navigation');
  await navigate('/linhagem#generation-4');assert.equal(await evaluate(`document.querySelector('#generation-select').value`),'4');
  assert.ok(await evaluate(`document.querySelector('#family-explorer').textContent.includes('Vínculo ou dado em investigação')`),'Uncertain dates do not claim uncertain relationships');
  await navigate('/arvore#overview');assert.equal(await evaluate(`document.querySelectorAll('#family-explorer .family-card').length`),await evaluate(`window.NAVES_CHART.people.length`),'Full overview lists each person');
  await navigate('/arvore');
  assert.equal(await evaluate('window.NAVES_CHART.people.filter(p=>p.generation===1).length'),2);
  assert.ok(await evaluate('window.NAVES_CHART.people.length>100'));
  assert.deepEqual(await evaluate(`window.NAVES_FAMILY.reduce((totals,branch)=>{const visit=(p,depth)=>{totals[depth]++;p.children.forEach(c=>visit(c,depth+1))};branch.children.forEach(p=>visit(p,0));return totals},[0,0,0])`),[15,30,4]);
  assert.ok(await evaluate(`(()=>{const {people,families}=window.NAVES_CHART;const names=ids=>ids.map(id=>people.find(p=>p.id===id).name).sort().join('|');const family=(parents,children)=>families.find(f=>names(f.parents)===parents.slice().sort().join('|')&&names(f.children)===children.slice().sort().join('|'));return !!family(['Carla Bianca','Itanel'],['Gustavo','Rafaela'])&&!!family(['Fábio','Nachima'],['João Pedro'])&&!!family(['Fábio','Paloma'],['Theo','Lara'])})()`));
  assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('João de Almeida Naves')`));
  assert.ok(await evaluate(`![...document.querySelectorAll('.family-group')].some(group=>group.textContent.includes('Família com Maria da Silva Leite')&&group.textContent.includes('Vínculo em investigação'))`),'A disputed birthplace must not make the couple’s parentage uncertain');
  assert.equal(await evaluate(`document.querySelector('#tree-viewport')`),null);
  await setInput('Carla Bianca');assert.ok(await evaluate(`!document.querySelector('#family-results').hidden`));
  await evaluate(`[...document.querySelectorAll('#family-results button')].find(b=>b.textContent.includes('Carla Bianca')).click()`);
  assert.ok(await evaluate(`[...document.querySelectorAll('.family-group')].some(s=>s.textContent.includes('Itanel')&&s.textContent.includes('Gustavo')&&s.textContent.includes('Rafaela'))`),'Carla and Itanel share their children');
  const personHash=await evaluate('location.hash');assert.ok(personHash.startsWith('#person='));
  await navigate('/arvore'+personHash);assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('Carla Bianca')`),'Person link survives reload');
  await setInput('Fábio');await evaluate(`[...document.querySelectorAll('#family-results button')].find(b=>b.textContent.includes('Fábio')).click()`);
  const groups=await evaluate(`[...document.querySelectorAll('.family-group')].map(s=>s.textContent)`);
  assert.ok(groups.some(s=>s.includes('Nachima')&&s.includes('João Pedro')&&!s.includes('Theo')));
  assert.ok(groups.some(s=>s.includes('Paloma')&&s.includes('Theo')&&s.includes('Lara')&&!s.includes('João Pedro')));
  await evaluate(`new Promise(resolve=>{addEventListener('popstate',resolve,{once:true});document.querySelector('#family-back').click()})`);
  assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('Carla Bianca')`),'Back restores the previous family');
  await evaluate(`new Promise(resolve=>{addEventListener('popstate',resolve,{once:true});history.forward()})`);
  assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('Fábio')`),'Forward restores the selected family');
  await setInput('not-a-family-name');assert.ok(await evaluate(`document.querySelector('#family-results').textContent.includes('Nenhum nome encontrado')`));
  await navigate('/arvore#generation-13');assert.equal(await evaluate(`document.querySelector('#generation-select').value`),'13');assert.ok(await evaluate(`document.querySelector('#family-explorer').textContent.includes('Bento')`));
  await navigate('/arvore#gilmar');assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('Gilmar')`));
  await evaluate(`new Promise(resolve=>{addEventListener('hashchange',resolve,{once:true});location.hash='#conteudo'})`);assert.ok(await evaluate(`document.querySelector('.family-focus-name').textContent.includes('Gilmar')`),'Page anchors preserve the focused person');
  await setInput('Pedro');await evaluate(`document.querySelector('#generation-select').value='13';document.querySelector('#generation-select').dispatchEvent(new Event('change'))`);assert.equal(await evaluate(`document.querySelector('#family-results').hidden`),true,'Generation navigation dismisses search results');
  await evaluate(`document.querySelector('[data-theme-toggle]').click()`);const theme=await evaluate(`document.documentElement.dataset.theme`);
  await navigate('/');assert.equal(await evaluate(`document.documentElement.dataset.theme`),theme);
  console.log('Checking responsive routes');
  for(const appearance of ['light','dark']) {
    await evaluate(`localStorage.setItem('naves-atlas-theme',${JSON.stringify(appearance)})`);
    for(const width of [320,390,768,1440]) {
      await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      for(const path of ['/','/arvore','/linhagem','/mapa']) {
        await navigate(path);
        assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),`${path}: overflow at ${width}`);
        if(path==='/arvore'||path==='/linhagem') {
          assert.ok(await evaluate(`[...document.querySelectorAll('.family-card-name')].every(n=>parseFloat(getComputedStyle(n).fontSize)>=16)`),'Readable names');
          assert.ok(await evaluate(`[...document.querySelectorAll('.family-card')].every(n=>n.getBoundingClientRect().width>=44&&n.getBoundingClientRect().height>=44)`),'Usable targets');
          assert.ok(await evaluate(`!document.querySelector('meta[name=viewport]').content.includes('user-scalable=no')`),'Native page zoom enabled');
          if(width<=390)assert.ok(await evaluate(`document.scrollingElement.scrollHeight>innerHeight`),'The page itself can scroll vertically');
        }
      }
    }
  }
  // Exercise Chromium's native page pinch rather than a custom canvas gesture.
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
  await navigate('/linhagem');
  const beforePinch=await evaluate('visualViewport.scale');
  await call('Input.synthesizePinchGesture',{x:180,y:350,scaleFactor:1.6,relativeSpeed:400,gestureSourceType:'touch'});
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const afterPinch=await evaluate('visualViewport.scale');
  if(afterPinch<=beforePinch){
    // Compare a minimal unrestricted page in this same browser before blaming the site.
    await evaluate(`document.open();document.write('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><p>Pinch control</p>');document.close()`);
    const controlBefore=await evaluate('visualViewport.scale');
    await call('Input.synthesizePinchGesture',{x:180,y:350,scaleFactor:1.6,relativeSpeed:400,gestureSourceType:'touch'});
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const controlAfter=await evaluate('visualViewport.scale');
    assert.ok(controlAfter<=controlBefore,`Site blocked pinch (${beforePinch} → ${afterPinch}) but control zoomed (${controlBefore} → ${controlAfter})`);
    console.log('SKIP: synthetic pinch did not zoom even the unrestricted control page; real-device pinch remains unverified.');
  }
  await call('Emulation.setTouchEmulationEnabled',{enabled:false});
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('/linhagem');assert.ok(await evaluate(`document.querySelector('h1').textContent.includes('linhagem histórica')`));assert.ok(await evaluate(`window.NAVES_CHART.people.some(p=>p.name==='Maria José Pereira'&&p.death.includes('1944'))`));
  await navigate('/arvore_naves.html');assert.equal(await evaluate(`document.querySelectorAll('.gen-section').length`),11);await evaluate(`document.querySelector('a[href="#g8"]').click()`);assert.equal(await evaluate(`location.hash`),'#g8');
  await navigate('/mapa');await evaluate(`document.querySelectorAll('.tl-item')[7].click()`);assert.ok(await evaluate(`document.querySelectorAll('.tl-item')[7].classList.contains('active')`));
  assert.deepEqual(errors,[],'Uncaught browser errors');
  console.log('PASS: responsive person-centered genealogy, 13 generations, search, stable links, family relationships, names and target sizes, native zoom settings, themes and routes.');
  await call('Browser.close');
} finally {
  ws?.close();
  if(browser && browser.exitCode===null){browser.kill();await new Promise(done=>{browser.once('exit',done);setTimeout(done,3000);});}
  server.closeAllConnections();
  await new Promise(done=>server.close(done));
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});
}
