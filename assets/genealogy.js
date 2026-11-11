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
    ['neuza/Carla Bianca','Itanel',['Gustavo','Rafaela'],'Cônjuge atual'],
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

  // One family unit per exact parent set. A couple has one descent junction.
  const unitsByKey=new Map(), owned=new Map();
  for(const edge of relationships.filter(edge=>edge.type==='parent')){
    const child=people.get(edge.to);
    const parents=relationships.filter(link=>link.type==='parent'&&link.to===child.id).map(link=>people.get(link.from));
    const key=parents.map(parent=>parent.id).sort().join('|');
    if(!unitsByKey.has(key)){
      const owner=parents.find(parent=>parent.path)||parents[0];
      const unit={id:'family-'+(unitsByKey.size+1),parents,children:[],owner};
      unitsByKey.set(key,unit);
      if(!owned.has(owner.id))owned.set(owner.id,[]);
      owned.get(owner.id).push(unit);
    }
    const unit=unitsByKey.get(key);if(!unit.children.includes(child))unit.children.push(child);
  }
  const input=document.getElementById('person-search'),filter=document.getElementById('branch-filter');
  const viewport=document.getElementById('tree-viewport'),root=document.getElementById('family-tree'),inspector=document.getElementById('person-inspector');
  const historicalPage=location.pathname==='/linhagem';
  if(!filter.querySelector('[value="ancestry"]')){const option=document.createElement('option');option.value='ancestry';option.textContent='Somente linhagem histórica';filter.append(option);}
  if(historicalPage){
    filter.value='ancestry';
    document.title='Linhagem histórica — Família Naves';
    document.querySelector('h1').textContent='A linhagem histórica.';
    document.querySelector('.page-intro .eyeline').textContent='02 / LINHAGEM HISTÓRICA · COMPILAÇÃO FAMILIAR';
    document.querySelector('.page-intro .dek').textContent='A linhagem e os parentes relacionados na compilação histórica, organizados por núcleos familiares. Selecione um casal ou uma pessoa para consultar as fontes e as divergências.';
    document.querySelector('.branch-jumps').hidden=true;
    document.querySelector('.page-intro .source-line').textContent='Dados da compilação da Editora Naves, com correções familiares identificadas. Datas e vínculos antigos não equivalem a certidões autenticadas.';
    document.querySelectorAll('.masthead nav a').forEach(link=>{if(link.getAttribute('href')==='/linhagem')link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  }
  let zoom=.45,world,canvas,shown=[],dimensions,appearances=new Map(),bounds=new Map(),active=[];
  let framing=historicalPage?'overview':'person',focusTarget=anesia;
  const boxW=182,boxH=112,gapX=28,gapY=116,padding=44;
  const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  function inspect(person){
    world.querySelectorAll('.genealogy-person').forEach(node=>node.classList.toggle('selected',node.dataset.person===person.id));
    inspector.replaceChildren(element('h2','',person.name),element('p','',person.note),element('p','source-line',person.source));
    if(person.birth)inspector.append(element('p','', 'Nascimento / local: '+person.birth));
    if(person.death)inspector.append(element('p','', 'Falecimento: '+person.death));
    for(const [type,label] of [['parent','Pais / mães informados'],['child','Filhos relacionados'],['partner','Relacionamentos']]){
      const relatives=relationships.filter(edge=>type==='parent'?edge.type==='parent'&&edge.to===person.id:type==='child'?edge.type==='parent'&&edge.from===person.id:edge.type==='partner'&&(edge.from===person.id||edge.to===person.id));
      if(!relatives.length)continue;
      const row=element('div','inspector-relatives');row.append(element('strong','',label+': '));
      relatives.forEach(edge=>{const id=type==='parent'?edge.from:type==='child'?edge.to:edge.from===person.id?edge.to:edge.from;const other=people.get(id);const button=element('button','',other.name);button.type='button';button.addEventListener('click',()=>{if(!shown.includes(other)){filter.value='';render();}focusPerson(other);inspect(other);});row.append(button);});inspector.append(row);
    }
  }
  function setZoom(value,anchor){
    const old=zoom,cx=(viewport.scrollLeft+viewport.clientWidth/2)/old,cy=(viewport.scrollTop+viewport.clientHeight/2)/old;
    zoom=Math.max(.025,Math.min(1.6,value));world.style.transform='scale('+zoom+')';canvas.style.width=dimensions.width*zoom+'px';canvas.style.height=dimensions.height*zoom+'px';document.getElementById('zoom-level').textContent=Math.round(zoom*100)+'%';
    if(anchor)centerRect(anchor);else viewport.scrollTo({left:cx*zoom-viewport.clientWidth/2,top:cy*zoom-viewport.clientHeight/2,behavior:'instant'});
  }
  function centerRect(rect){viewport.scrollTo({left:Math.max(0,(rect.x+rect.width/2)*zoom-viewport.clientWidth/2),top:Math.max(0,rect.y*zoom-36),behavior:'instant'});}
  function focusPerson(person,fit=true){
    framing='person';focusTarget=person;
    const rect=bounds.get(person.id)||appearances.get(person.id)?.[0];if(!rect)return;
    if(fit)setZoom(Math.min(.6,(viewport.clientWidth-36)/rect.width,(viewport.clientHeight-45)/Math.min(rect.height,4*(boxH+gapY))));
    centerRect(rect);
  }
  function render(){
    root.replaceChildren();appearances=new Map();bounds=new Map();
    shown=[...people.values()].filter(person=>filter.value==='ancestry'?person.generation<=9:!filter.value||person.generation<=9||person.branch===filter.value);
    const visible=new Set(shown.map(person=>person.id)),visited=new Set();
    function build(person,trail=new Set()){
      const next=new Set(trail);next.add(person.id);
      const families=(owned.get(person.id)||[]).filter(unit=>unit.parents.every(p=>visible.has(p.id))&&unit.children.some(child=>visible.has(child.id)));
      const blocks=families.length?families.map(unit=>{
        const children=unit.children.filter(child=>visible.has(child.id)).map(child=>build(child,next));
        const parents=[...unit.parents];
        const companions=families.length===1?relationships.filter(edge=>edge.type==='partner'&&(edge.from===person.id||edge.to===person.id)).map(edge=>people.get(edge.from===person.id?edge.to:edge.from)).filter(p=>visible.has(p.id)&&!parents.includes(p)):[];
        // Companion cards do not become parents; descent starts at the known parent.
        return {person,parents,cards:[...parents,...companions],children,unit};
      }):(()=>{const partners=relationships.filter(edge=>edge.type==='partner'&&(edge.from===person.id||edge.to===person.id)).map(edge=>people.get(edge.from===person.id?edge.to:edge.from)).filter(p=>visible.has(p.id));return partners.length?partners.map(partner=>({person,parents:[person],cards:[person,partner],children:[],unit:null})):[{person,parents:[person],cards:[person],children:[],unit:null}];})();
      const width=blocks.reduce((total,block)=>{block.width=Math.max(block.cards.length*(boxW+gapX)-gapX,block.children.reduce((sum,child)=>sum+child.width+gapX,0)-gapX,boxW);return total+block.width+gapX;},0)-gapX;
      return {person,blocks,width,height:boxH+gapY+Math.max(0,...blocks.flatMap(block=>block.children.map(child=>child.height)))};
    }
    const roots=shown.filter(person=>!relationships.some(edge=>edge.type==='parent'&&edge.to===person.id&&visible.has(edge.from)) && owned.has(person.id));
    const trees=roots.map(person=>build(person));
    function remember(tree){tree.blocks.forEach(block=>{block.cards.forEach(person=>visited.add(person.id));block.children.forEach(remember);});}
    trees.forEach(remember);
    // Collateral records with unresolved parentage are shown separately, without invented links.
    const unlinked=shown.filter(person=>!visited.has(person.id));
    const width=Math.max(trees.reduce((sum,tree)=>sum+tree.width+60,0),Math.min(8,unlinked.length)*(boxW+gapX))+padding*2;
    const maxGeneration=Math.max(...shown.map(person=>person.generation));
    const unlinkedY=padding+maxGeneration*(boxH+gapY)+40;
    dimensions={width,height:unlinkedY+Math.ceil(unlinked.length/8)*(boxH+50)+padding};
    canvas=element('div','genealogy-canvas');world=element('div','genealogy-world');world.style.width=width+'px';world.style.height=dimensions.height+'px';canvas.append(world);root.append(canvas);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',width);svg.setAttribute('height',dimensions.height);svg.setAttribute('aria-hidden','true');svg.classList.add('genealogy-lines');world.append(svg);
    active=[];
    const query=normalize(input.value);let matches=[];
    function drawPath(d,cls,unit){
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);path.classList.add('genealogy-edge',cls);
      if(unit?.parents.some(person=>person.uncertain))path.classList.add('uncertain');
      if(unit)path.dataset.family=unit.id;svg.append(path);
    }
    function card(person,x,y){
      const locations=appearances.get(person.id)||[];const repeated=locations.length>0;locations.push({x,y,width:boxW,height:boxH});appearances.set(person.id,locations);
      const button=element('button','genealogy-person');button.type='button';button.dataset.person=person.id;button.style.left=x+'px';button.style.top=y+'px';
      button.setAttribute('aria-label',person.name+', '+person.generation+'ª geração'+(repeated?', mesmo registro em outro núcleo':''));
      button.append(element('span','chart-name',person.name+(person.deceased||person.death?' †':'')),element('span','chart-record',person.birth||person.generation+'ª geração'),element('span','chart-source',repeated?'↗ Mesma pessoa · outro núcleo':person.uncertain?'Em investigação':person.source.startsWith('Confirmação')?'Confirmação familiar':person.source.startsWith('Texto')?'Texto familiar fornecido':'Compilação histórica'));
      if(person.uncertain)button.classList.add('uncertain');if(query&&normalize(person.name+' '+person.note).includes(query)){button.classList.add('match');matches.push(person);}button.addEventListener('click',()=>inspect(person));world.append(button);
    }
    function place(tree,left){
      const y=padding+(tree.person.generation-1)*(boxH+gapY);let bx=left;
      tree.blocks.forEach(block=>{
        const cardWidth=block.cards.length*(boxW+gapX)-gapX,start=bx+(block.width-cardWidth)/2;
        const positions=block.cards.map((person,index)=>({person,x:start+index*(boxW+gapX),y}));
        positions.forEach(({person,x,y})=>card(person,x,y));
        const primary=positions.find(position=>position.person.id===tree.person.id)||positions[0];
        block.anchor={x:primary.x+boxW/2,y};if(!tree.anchor)tree.anchor=block.anchor;
        // Draw each partnership only inside its own family unit, never through another partner.
        for(const edge of relationships.filter(edge=>edge.type==='partner')){
          const a=positions.find(p=>p.person.id===edge.from),b=positions.find(p=>p.person.id===edge.to);
          if(a&&b)drawPath('M'+(Math.min(a.x,b.x)+boxW)+','+(y+boxH/2)+' H'+Math.max(a.x,b.x),'partner',block.unit);
        }
        let sourceX=positions.filter(position=>block.parents.includes(position.person)).reduce((sum,p)=>sum+p.x+boxW/2,0)/block.parents.length;
        const sourceY=block.parents.length===2?y+boxH/2:y+boxH;
        const childWidth=block.children.reduce((sum,child)=>sum+child.width+gapX,0)-gapX;let childLeft=bx+(block.width-childWidth)/2;
        block.children.forEach(child=>{place(child,childLeft);childLeft+=child.width+gapX;});
        if(block.children.length){
          const junctionY=y+boxH+46,anchors=block.children.map(child=>child.anchor);
          drawPath('M'+sourceX+','+sourceY+' V'+junctionY,'parent',block.unit);
          const xs=[sourceX,...anchors.map(anchor=>anchor.x)];
          drawPath('M'+Math.min(...xs)+','+junctionY+' H'+Math.max(...xs),'parent',block.unit);
          anchors.forEach(anchor=>drawPath('M'+anchor.x+','+junctionY+' V'+anchor.y,'parent',block.unit));
          if(block.parents.length===1 && block.cards.length>1){const label=element('div','family-caption','Filiação informada: '+block.parents[0].name);label.style.left=bx+'px';label.style.top=y+boxH+8+'px';label.style.width=block.width+'px';world.append(label);}
          active.push({id:block.unit.id,parents:block.parents.map(p=>p.id),children:block.children.map(child=>child.person.id),x:bx,y,width:block.width});
        }
        bx+=block.width+gapX;
      });
      bounds.set(tree.person.id,{x:left,y,width:tree.width,height:tree.height});return tree;
    }
    let left=padding;trees.forEach(tree=>{place(tree,left);left+=tree.width+60;});
    if(unlinked.length){const label=element('div','generation-label','REGISTROS SEM CONTINUAÇÃO DE FILIAÇÃO NESTA VISTA · CONSULTE OS DETALHES');label.style.left=padding+'px';label.style.top=unlinkedY-28+'px';world.append(label);unlinked.forEach((person,index)=>card(person,padding+(index%8)*(boxW+gapX),unlinkedY+Math.floor(index/8)*(boxH+50)));}
    for(let generation=1;generation<=maxGeneration;generation++){const label=element('div','generation-label',generation+'ª GERAÇÃO');label.style.top=padding+(generation-1)*(boxH+gapY)-24+'px';label.style.left=padding+'px';world.append(label);}
    document.getElementById('empty').hidden=!query||matches.length>0;
    const uniqueMatches=[...new Set(matches.map(person=>person.id))];
    document.getElementById('tree-status').textContent=shown.length+' pessoas · '+maxGeneration+' gerações'+(query?' · '+uniqueMatches.length+' correspondências':'')+'. Casais com filhos em comum têm uma única linha de descendência.';
    setZoom(zoom);if(matches.length){focusPerson(matches[0]);inspect(matches[0]);}
    window.NAVES_CHART={people:[...people.values()],relationships,families:[...unitsByKey.values()].map(unit=>({id:unit.id,parents:unit.parents.map(p=>p.id),children:unit.children.map(p=>p.id)})),visibleFamilies:active};
  }
  function fitAll(){framing='overview';setZoom(Math.min(.6,(viewport.clientWidth-24)/dimensions.width,(viewport.clientHeight-24)/dimensions.height));viewport.scrollTo(0,0);}
  document.getElementById('zoom-in').addEventListener('click',()=>{framing='manual';setZoom(zoom*1.3);});document.getElementById('zoom-out').addEventListener('click',()=>{framing='manual';setZoom(zoom/1.3);});
  document.getElementById('fit-tree').addEventListener('click',()=>{input.value='';filter.value=historicalPage?'ancestry':'';render();fitAll();});
  document.getElementById('center-anesia').addEventListener('click',()=>{filter.value='';input.value='';render();focusPerson(anesia);inspect(anesia);});
  document.getElementById('show-origins').addEventListener('click',()=>{filter.value='ancestry';render();fitAll();});
  input.addEventListener('input',render);filter.addEventListener('change',()=>{render();const person=branchRoots.get(filter.value);if(person)focusPerson(person);else fitAll();});
  document.getElementById('tree-search').addEventListener('submit',event=>event.preventDefault());document.getElementById('tree-search').addEventListener('reset',()=>{input.value='';filter.value=historicalPage?'ancestry':'';render();fitAll();});
  function openBranch(){
    const id=location.hash.slice(1);
    if(id==='overview'){filter.value='';input.value='';render();fitAll();viewport.scrollIntoView({block:'start',behavior:'instant'});return;}
    const match=id.match(/^generation-(\d+)$/);
    if(match){
      const generation=Number(match[1]);if(generation<1||generation>13)return;
      filter.value=generation<=9?'ancestry':'';input.value='';render();
      const rectangles=shown.filter(person=>person.generation===generation).flatMap(person=>appearances.get(person.id)||[]);
      if(rectangles.length){const x=Math.min(...rectangles.map(rect=>rect.x)),right=Math.max(...rectangles.map(rect=>rect.x+rect.width));setZoom(Math.min(.6,(viewport.clientWidth-36)/(right-x)));centerRect({x,y:rectangles[0].y,width:right-x,height:boxH});framing='manual';}
      viewport.scrollIntoView({block:'start',behavior:'instant'});return;
    }
    if(branchRoots.has(id)){filter.value=id;render();const person=branchRoots.get(id);focusPerson(person);inspect(person);viewport.scrollIntoView({block:'start',behavior:'instant'});}
  }
  render();fitAll();window.addEventListener('hashchange',openBranch);document.fonts.ready.then(openBranch);
  let previousWidth=viewport.clientWidth;
  new ResizeObserver(()=>{if(viewport.clientWidth===previousWidth)return;previousWidth=viewport.clientWidth;if(framing==='overview')fitAll();else if(framing==='person')focusPerson(focusTarget);}).observe(viewport);
})();
