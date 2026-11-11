/* A layered pedigree: shared ancestors occur once; spouses never imply parentage. */
(() => {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const people = new Map(), relationships = [], historic = new Map();
  let serial = 0;
  const add = (name, generation, fields = {}) => {
    const person = {id:`person-${++serial}`, name, generation, order:serial, note:'', branch:'', source:'Compilação histórica · Editora Naves, 2025', ...fields};
    people.set(person.id, person); return person;
  };
  const alias = name => normalize(name).replace(' (neto)', '').replace('maria rita de jesus naves','maria rita nascimento').replace('belmira naves','belmira pereira naves').replace('anesia naves da silva','anesia naves');
  const historyPerson = (name, generation, fields={}) => {
    const key=`${generation}:${alias(name)}`;
    if(historic.has(key)){const person=historic.get(key);Object.assign(person,fields);return person;}
    const person=add(name,generation,fields);historic.set(key,person);return person;
  };
  const connect = (from,to,type='parent',uncertain=false) => {
    if(!relationships.some(edge=>edge.from===from.id && edge.to===to.id && edge.type===type))relationships.push({from:from.id,to:to.id,type,uncertain});
  };
  const historicalFields = p => ({note:p.note||'',birth:p.b||'',death:p.d||'',uncertain:/investiga|não confirm|em aberto/i.test(`${p.name} ${p.note} ${p.d}`)});
  for(const [index,record] of window.NAVES_LINEAGE.entries()){
    const generation=index+1;if(generation>9)break;
    const first=historyPerson(record.p1.name,generation,historicalFields(record.p1));
    const second=historyPerson(record.p2.name,generation,historicalFields(record.p2));second.order=first.order+.1;
    connect(first,second,'partner',first.uncertain||second.uncertain);
    let otherFirst,otherSecond;
    if(record.p1b){otherFirst=historyPerson(record.p1b.name,generation,historicalFields(record.p1b));otherSecond=historyPerson(record.p2b.name,generation,historicalFields(record.p2b));otherSecond.order=otherFirst.order+.1;connect(otherFirst,otherSecond,'partner');}
    if(generation===9)continue; // The family-confirmed roster supplies every modern branch.
    record.children.forEach(child=>{
      const person=historyPerson(child.n,generation+1,{birth:child.d});
      if(generation===5){
        if(child.n==='Umbelina Rosa Naves'){connect(first,person);connect(second,person);}
        else if(child.n==='Francisco de Paula Naves'){connect(otherFirst,person);connect(otherSecond,person);}
        else {person.uncertain=true;person.note='Relacionado entre os descendentes dos dois núcleos desta geração. O núcleo parental não foi individualizado; sem linha de filiação até a confirmação.';}
      }else{connect(first,person,'parent',first.uncertain);connect(second,person,'parent',second.uncertain);}
    });
  }
  const anesia=historyPerson('Anésia Naves da Silva',9),antonio=historyPerson('Antônio Alves da Silva',9);
  const messias=historyPerson('Messias Brasiliense Naves',8);
  const purcina=add('Purcina Maria de Jesus',8,{order:messias.order-.1,birth:'Uberlândia, MG',note:'Primeiro casamento de Messias, conforme o texto familiar fornecido.',source:'Texto familiar fornecido · revisão de 2026'});
  connect(messias,purcina,'partner');
  for(const [name,birth,death] of [['Marcília Rosa','Uberlândia, MG',''],['Albertina Rosa Naves','Uberlândia, MG',''],['Belarmino','Morrinhos, GO','1943'],['Beraldino Brasiliense Naves','Morrinhos, GO','2009 · Itapaci, GO']]){
    const child=add(name,9,{birth,death,note:'Filho(a) de Messias e Purcina no texto familiar fornecido.',source:purcina.source,order:anesia.order-5+serial/1000});connect(messias,child);connect(purcina,child);
  }
  const branchRoots=new Map(), pathPeople=new Map();
  function addModern(data,generation,branch,path,parent){
    const person=add(data.name,generation,{branch,note:data.note,deceased:data.deceased,source:'Confirmação familiar · 11.11.2026',path});
    pathPeople.set(path,person);if(parent)connect(parent,person);
    const partnerMatch=!/^Foi casada/i.test(data.note) && data.note.match(/casad[oa] com ([^.;]+)[.;]/i);
    if(partnerMatch){const partner=add(partnerMatch[1],generation,{branch,note:'Cônjuge atual. Filiação dos descendentes apenas quando informada expressamente.',source:person.source,order:person.order+.1});person.partner=partner.id;connect(person,partner,'partner');}
    data.children.forEach(child=>addModern(child,generation+1,branch,`${path}/${child.name}`,person));return person;
  }
  window.NAVES_FAMILY.forEach(branch=>{
    const root=addModern({name:branch.name,note:branch.note,children:branch.children},10,branch.id,branch.id,anesia);connect(antonio,root);branchRoots.set(branch.id,root);
  });
  const explicitOtherParents = [
    ['nilza/Viviane','Fabrício',['Gabriel'],'Relacionamento anterior'],
    ['nilza/Viviane','Alexandre',['Laura','Pedro'],'Cônjuge atual'],
    ['nilda/Waleska','Wagner',['Mariana'],'Cônjuge atual'],
    ['neyde/Luciano','Denise',['Yasmin'],'Casamento anterior'],
    ['neyde/Luciano','Franciele',['Artur','Heitor','Rafael'],'Cônjuge atual'],
    ['gilmar/Fábio','Nachima',['João Pedro'],'Relacionamento anterior'],
    ['gilmar/Fábio','Paloma',['Theo','Lara'],'Cônjuge atual'],
    ['gilmar','Zélia',['Rodrigo','Brunno'],'Cônjuge atual'],
    ['gilberto','Olga',['Cristiane'],'Casamento anterior']
  ];
  explicitOtherParents.forEach(([path,name,children,note])=>{
    const parent=pathPeople.get(path);
    let other=people.get(parent.partner);
    if(!other || other.name!==name){other=add(name,parent.generation,{branch:parent.branch,note,source:parent.source,order:parent.order+.2});connect(parent,other,'partner');}
    children.forEach(name=>connect(other,pathPeople.get(`${path}/${name}`)));
  });
  // Nilda's former marriage is known; this does not establish João's paternity.
  const nilda=branchRoots.get('nilda');const joao=add('João',10,{branch:'nilda',note:'Ex-cônjuge de Nilda. Paternidade dos filhos não atribuída nesta atualização.',source:nilda.source,order:nilda.order+.1});connect(nilda,joao,'partner');
  const input=document.getElementById('person-search'),filter=document.getElementById('branch-filter');
  const viewport=document.getElementById('tree-viewport'),root=document.getElementById('family-tree');
  const inspector=document.getElementById('person-inspector');
  let zoom=.75,world,canvas,shown=[],selected,dimensions;
  const boxW=182,boxH=112,gapX=30,gapY=94,padding=60;
  const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  function inspect(person){
    selected=person.id;world.querySelectorAll('.genealogy-person').forEach(node=>node.classList.toggle('selected',node.dataset.person===person.id));
    world.querySelectorAll('.genealogy-edge').forEach(edge=>edge.classList.toggle('related',edge.dataset.from===person.id||edge.dataset.to===person.id));
    inspector.replaceChildren(element('h2','',person.name),element('p','',person.note),element('p','source-line',person.source));
    if(person.birth)inspector.append(element('p','',`Nascimento / local: ${person.birth}`));
    if(person.death)inspector.append(element('p','',`Falecimento: ${person.death}`));
    for(const [type,label] of [['parent','Pais / mães informados'],['child','Filhos relacionados'],['partner','Relacionamentos']]){
      const relatives=relationships.filter(edge=>type==='parent'?edge.type==='parent'&&edge.to===person.id:type==='child'?edge.type==='parent'&&edge.from===person.id:edge.type==='partner'&&(edge.from===person.id||edge.to===person.id));
      if(!relatives.length)continue;
      const row=element('div','inspector-relatives');row.append(element('strong','',`${label}: `));
      relatives.forEach(edge=>{const id=type==='parent'?edge.from:type==='child'?edge.to:edge.from===person.id?edge.to:edge.from;const other=people.get(id);const button=element('button','',other.name);button.type='button';button.addEventListener('click',()=>{if(!shown.includes(other)){filter.value='';render();}center(other);inspect(other);});row.append(button);});inspector.append(row);
    }
  }
  function center(person){viewport.scrollTo({left:Math.max(0,(person.x+boxW/2)*zoom-viewport.clientWidth/2),top:Math.max(0,person.y*zoom-100),behavior:'instant'});}
  function setZoom(value,anchor){
    const old=zoom;const cx=(viewport.scrollLeft+viewport.clientWidth/2)/old,cy=(viewport.scrollTop+viewport.clientHeight/2)/old;
    zoom=Math.max(.08,Math.min(1.6,value));world.style.transform=`scale(${zoom})`;canvas.style.width=`${dimensions.width*zoom}px`;canvas.style.height=`${dimensions.height*zoom}px`;document.getElementById('zoom-level').textContent=`${Math.round(zoom*100)}%`;
    if(anchor)center(anchor);else viewport.scrollTo({left:cx*zoom-viewport.clientWidth/2,top:cy*zoom-viewport.clientHeight/2,behavior:'instant'});
  }
  function render(){
    root.replaceChildren();shown=[...people.values()].filter(person=>!filter.value||person.generation<=9||person.branch===filter.value);
    const rows=Array.from({length:13},(_,i)=>shown.filter(person=>person.generation===i+1).sort((a,b)=>a.order-b.order));
    const modernRoots=shown.filter(person=>person.generation===10&&person.path);
    const visibleIds=new Set(shown.map(person=>person.id));
    const childrenOf=person=>relationships.filter(edge=>edge.type==='parent'&&edge.from===person.id&&visibleIds.has(edge.to)&&people.get(edge.to).path).map(edge=>people.get(edge.to));
    const partnersOf=person=>relationships.filter(edge=>edge.type==='partner'&&edge.from===person.id&&visibleIds.has(edge.to)&&!people.get(edge.to).path).map(edge=>people.get(edge.to));
    const widths=new Map();
    function measure(person){const children=childrenOf(person);const width=Math.max((1+partnersOf(person).length)*(boxW+gapX),children.reduce((sum,child)=>sum+measure(child),0));widths.set(person.id,width);return width;}
    const forestWidth=modernRoots.reduce((sum,person)=>sum+measure(person),0);
    const width=Math.max(forestWidth,...rows.map(row=>row.length*(boxW+gapX)))+padding*2;
    dimensions={width,height:13*(boxH+gapY)+padding*2};
    rows.forEach((row,index)=>row.forEach((person,position)=>{person.x=(width-row.length*(boxW+gapX))/2+position*(boxW+gapX);person.y=padding+index*(boxH+gapY);}));
    function place(person,left){const partners=partnersOf(person),unitWidth=(partners.length+1)*(boxW+gapX);person.x=left+(widths.get(person.id)-unitWidth)/2;partners.forEach((partner,index)=>{partner.x=person.x+(index+1)*(boxW+gapX);});const children=childrenOf(person),childWidth=children.reduce((sum,child)=>sum+widths.get(child.id),0);let childLeft=left+(widths.get(person.id)-childWidth)/2;children.forEach(child=>{place(child,childLeft);childLeft+=widths.get(child.id);});}
    let left=(width-forestWidth)/2;modernRoots.forEach(person=>{place(person,left);left+=widths.get(person.id);});
    canvas=element('div','genealogy-canvas');world=element('div','genealogy-world');world.style.width=`${width}px`;world.style.height=`${dimensions.height}px`;canvas.append(world);root.append(canvas);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',width);svg.setAttribute('height',dimensions.height);svg.setAttribute('aria-hidden','true');svg.classList.add('genealogy-lines');world.append(svg);
    const visible=new Set(shown.map(person=>person.id));
    const parentLanes=new Map();
    relationships.filter(edge=>visible.has(edge.from)&&visible.has(edge.to)).forEach(edge=>{
      const from=people.get(edge.from),to=people.get(edge.to),path=document.createElementNS(svg.namespaceURI,'path');
      let d;
      if(edge.type==='partner'){const a=from.x<to.x?from:to,b=a===from?to:from;d=`M${a.x+boxW},${a.y+boxH/2} H${b.x}`;}
      else{if(!parentLanes.has(from.id))parentLanes.set(from.id,[...parentLanes.keys()].filter(id=>people.get(id).generation===from.generation).length);const x=from.x+boxW/2,y=from.y+boxH,tx=to.x+boxW/2,ty=to.y,mid=y+18+(parentLanes.get(from.id)%18)*3;d=`M${x},${y} V${mid} H${tx} V${ty}`;}
      path.setAttribute('d',d);path.classList.add('genealogy-edge',edge.type);if(edge.uncertain)path.classList.add('uncertain');path.dataset.from=edge.from;path.dataset.to=edge.to;svg.append(path);
    });
    rows.forEach((row,index)=>{if(!row.length)return;const label=element('div','generation-label',`${index+1}ª GERAÇÃO`);label.style.top=`${padding+index*(boxH+gapY)-28}px`;label.style.left=`${Math.min(...row.map(person=>person.x))}px`;world.append(label);});
    const query=normalize(input.value);let matches=[];
    shown.forEach(person=>{
      const button=element('button','genealogy-person');button.type='button';button.dataset.person=person.id;button.style.left=`${person.x}px`;button.style.top=`${person.y}px`;button.setAttribute('aria-label',`${person.name}, ${person.generation}ª geração${person.uncertain?', vínculo em investigação':''}`);
      button.append(element('span','chart-name',`${person.name}${person.deceased||person.death?' †':''}`));button.append(element('span','chart-record',person.birth||`${person.generation}ª geração`));button.append(element('span','chart-source',person.uncertain?'Em investigação':person.source.startsWith('Confirmação')?'Confirmação familiar':person.source.startsWith('Texto')?'Texto familiar fornecido':'Compilação histórica'));
      if(person.uncertain)button.classList.add('uncertain');if(query&&normalize(`${person.name} ${person.note}`).includes(query)){button.classList.add('match');matches.push(person);}button.addEventListener('click',()=>inspect(person));world.append(button);
    });
    document.getElementById('empty').hidden=!query||matches.length>0;
    document.getElementById('tree-status').textContent=`${shown.length} registros na árvore · ${query?`${matches.length} correspondências`:'13 gerações na linhagem e nos ramos disponíveis'}. Selecione uma pessoa para ver os detalhes.`;
    setZoom(zoom);if(matches.length){center(matches[0]);inspect(matches[0]);}
  }
  document.getElementById('zoom-in').addEventListener('click',()=>setZoom(zoom*1.3));document.getElementById('zoom-out').addEventListener('click',()=>setZoom(zoom/1.3));
  document.getElementById('fit-tree').addEventListener('click',()=>{filter.value='';input.value='';render();setZoom(Math.min(viewport.clientWidth/dimensions.width,viewport.clientHeight/dimensions.height));viewport.scrollTo(0,0);});
  document.getElementById('center-anesia').addEventListener('click',()=>{filter.value='';input.value='';render();setZoom(.8,anesia);inspect(anesia);});
  document.getElementById('show-origins').addEventListener('click',()=>{setZoom(.8,shown.find(person=>person.generation===1));});
  input.addEventListener('input',render);filter.addEventListener('change',()=>{render();center(branchRoots.get(filter.value)||anesia);});
  document.getElementById('tree-search').addEventListener('submit',event=>event.preventDefault());document.getElementById('tree-search').addEventListener('reset',()=>{input.value='';filter.value='';render();center(anesia);});
  function openBranch(){const id=location.hash.slice(1);if(branchRoots.has(id)){filter.value=id;render();const person=branchRoots.get(id);center(person);inspect(person);viewport.scrollIntoView({block:'start',behavior:'instant'});}}
  render();center(anesia);window.addEventListener('hashchange',openBranch);document.fonts.ready.then(openBranch);
  window.NAVES_CHART={people:[...people.values()],relationships};
})();
