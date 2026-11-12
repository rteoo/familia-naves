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
      }else{
        // A disputed birthplace or death date does not by itself make parentage uncertain.
        const uncertainParent = parent => /identidade em investigação|identificação e os vínculos|filiação.*investiga/i.test(parent.name+' '+parent.note);
        connect(first,person,'parent',uncertainParent(first));connect(second,person,'parent',uncertainParent(second));
      }
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


  // A stable address is derived from the available lineage and family path, not array order.
  const stableKey = person => [person.generation,person.branch||'hist',person.path||normalize(person.name).replace(/[^a-z0-9]+/g,'-')].join(':');
  const byKey=new Map();
  for(const person of people.values()){
    const key=stableKey(person);
    if(byKey.has(key)) throw new Error('Duplicate genealogy identity: '+key);
    person.key=key;byKey.set(key,person);
  }
  const all=[...people.values()];
  const families=new Map();
  for(const edge of relationships.filter(link=>link.type==='parent')){
    const child=people.get(edge.to);
    const parentLinks=relationships.filter(link=>link.type==='parent'&&link.to===child.id);
    const parents=parentLinks.map(link=>people.get(link.from));
    const key=parents.map(parent=>parent.id).sort().join('|');
    if(!families.has(key))families.set(key,{parents,children:[],uncertain:parentLinks.some(link=>link.uncertain)});
    const unit=families.get(key);if(!unit.children.includes(child))unit.children.push(child);
  }
  const root=document.getElementById('family-explorer'),search=document.getElementById('family-search'),results=document.getElementById('family-results'),generation=document.getElementById('generation-select'),status=document.getElementById('explorer-status');
  const historicalPage=location.pathname==='/linhagem';
  if(historicalPage){
    document.title='Linhagem histórica — Família Naves';
    document.querySelector('h1').textContent='A linhagem histórica.';
    document.querySelector('.page-intro .eyeline').textContent='02 / LINHAGEM HISTÓRICA · COMPILAÇÃO FAMILIAR';
    document.querySelector('.page-intro .dek').textContent='Explore a família pessoa por pessoa: pais, relacionamentos e filhos aparecem em grupos legíveis. Selecione um nome para seguir a linhagem.';
    document.querySelector('.page-intro .source-line').textContent='Dados da compilação da Editora Naves, com correções familiares identificadas. Datas e vínculos antigos não equivalem a certidões autenticadas.';
    document.querySelectorAll('.masthead nav a').forEach(link=>{if(link.getAttribute('href')==='/linhagem')link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  }
  for(let i=1;i<=13;i++){const option=document.createElement('option');option.value=String(i);option.textContent=i+'ª geração';generation.append(option);}
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  const relation=(person,type)=>relationships.filter(edge=>type==='parents'?edge.type==='parent'&&edge.to===person.id:type==='children'?edge.type==='parent'&&edge.from===person.id:edge.type==='partner'&&(edge.from===person.id||edge.to===person.id)).map(edge=>people.get(type==='parents'?edge.from:type==='children'?edge.to:edge.from===person.id?edge.to:edge.from));
  const label=person=>person.name+(person.deceased||person.death?' †':'');
  let current;
  function select(person,push=true){
    if(!person)return;
    if(push)history.pushState(null,'','#person='+encodeURIComponent(person.key));
    current=person;generation.value='';search.value='';results.replaceChildren();results.hidden=true;
    renderPerson(person);
    if(push){root.scrollIntoView({block:'start',behavior:'instant'});root.querySelector('h2')?.focus({preventScroll:true});}
  }
  function personButton(person,subtitle){
    const button=el('button','family-card');button.type='button';button.dataset.personKey=person.key;
    button.append(el('strong','family-card-name',label(person)),el('span','family-card-meta',subtitle||person.generation+'ª geração'));
    if(person.uncertain)button.append(el('span','family-card-uncertain','Vínculo ou dado em investigação'));
    button.addEventListener('click',()=>select(person));return button;
  }
  function group(title,description){
    const section=el('section','family-group');section.append(el('h3','family-group-title',title));if(description)section.append(el('p','family-group-caption',description));root.append(section);return section;
  }
  function renderPerson(person){
    root.replaceChildren();
    status.textContent='Geração '+person.generation+' de 13 · '+all.length+' pessoas registradas';
    const parents=relation(person,'parents');
    if(parents.length){
      const uncertain=relationships.some(edge=>edge.type==='parent'&&edge.to===person.id&&edge.uncertain);
      const section=group('Pais e mães',uncertain?'Vínculo em investigação. Consulte as fontes antes de confirmar.':'Selecione um nome para continuar na geração anterior.');
      const grid=el('div','family-card-grid parents-grid');parents.forEach(parent=>grid.append(personButton(parent)));section.append(grid);
    }
    const focal=el('section','family-focus');focal.append(el('span','family-kicker',person.generation+'ª GERAÇÃO'));
    if(parents.length)focal.classList.add('has-parents');
    const title=el('h2','family-focus-name',label(person));title.tabIndex=-1;focal.append(title);
    if(person.birth)focal.append(el('p','family-fact','Nascimento / local: '+person.birth));
    if(person.death)focal.append(el('p','family-fact','Falecimento: '+person.death));
    if(person.uncertain)focal.append(el('p','family-warning','Vínculo ou dado em investigação'));
    const details=el('details','family-details');details.append(el('summary','','Fontes e observações'));
    if(person.note)details.append(el('p','',person.note));details.append(el('p','',person.source));focal.append(details);root.append(focal);
    const own=[...families.values()].filter(unit=>unit.parents.includes(person));
    const displayedPartners=new Set();
    own.forEach(unit=>{
      const others=unit.parents.filter(parent=>parent!==person);others.forEach(parent=>displayedPartners.add(parent.id));
      const uncertain=unit.uncertain;
      const description=others.length?'Filiação informada para '+[person,...others].map(parent=>parent.name).join(' e ')+'.':'Filiação informada apenas para '+person.name+'. Outro genitor não informado nesta atualização.';
      const section=group(others.length?'Família com '+others.map(parent=>parent.name).join(' e '):'Filhos de '+person.name,description);
      if(uncertain)section.append(el('p','family-warning','Vínculo em investigação'));
      if(others.length){const partners=el('div','family-partners');others.forEach(partner=>partners.append(personButton(partner,'Ver esta pessoa')));section.append(partners);}
      const children=el('div','family-card-grid children-grid');unit.children.forEach(child=>children.append(personButton(child,'Filho(a) · '+child.generation+'ª geração')));section.append(children);
    });
    const otherPartners=relation(person,'partners').filter(partner=>!displayedPartners.has(partner.id));
    if(own.length||otherPartners.length)focal.classList.add('has-relatives');
    if(otherPartners.length){const section=group('Relacionamentos','Sem filiação de filhos atribuída a este vínculo nesta pesquisa.');const grid=el('div','family-card-grid');otherPartners.forEach(partner=>grid.append(personButton(partner,'Ver esta pessoa')));section.append(grid);}
    if(!own.length&&!otherPartners.length)root.append(el('p','family-empty','Nenhum relacionamento ou descendente foi registrado nesta pesquisa.'));
  }
  function listPeople(list,heading){
    search.value='';results.replaceChildren();results.hidden=true;
    root.replaceChildren();const title=el('h2','family-index-title',heading);title.tabIndex=-1;root.append(title);
    const listEl=el('div','family-index');list.forEach(person=>listEl.append(personButton(person,person.generation+'ª geração · '+(person.branch?'Ramo '+person.branch:'Linhagem histórica'))));root.append(listEl);
    status.textContent=list.length+' pessoas · selecione um nome para explorar os parentescos';
  }
  function applyLocation(){
    const hash=decodeURIComponent(location.hash.slice(1));
    if(hash.startsWith('person=')){const person=byKey.get(hash.slice(7));if(person){select(person,false);return;}}
    if(hash==='overview'){generation.value='';listPeople(all,'Todas as gerações');return;}
    const gm=hash.match(/^generation-(\d+)$/);if(gm){const number=Number(gm[1]);generation.value=String(number);listPeople(all.filter(p=>p.generation===number),number+'ª geração');return;}
    if(branchRoots.has(hash)){select(branchRoots.get(hash),false);return;}
    if(!hash||!current)select(all.find(p=>p.generation===1),false);
  }
  generation.addEventListener('change',()=>{const n=Number(generation.value);if(!n)return;history.pushState(null,'','#generation-'+n);listPeople(all.filter(p=>p.generation===n),n+'ª geração');root.scrollIntoView({block:'start',behavior:'instant'});root.querySelector('h2')?.focus({preventScroll:true});});
  search.addEventListener('input',()=>{
    const query=normalize(search.value);results.replaceChildren();results.hidden=!query;
    if(!query)return;
    const matched=all.filter(person=>normalize(person.name).includes(query));
    if(!matched.length){results.append(el('p','family-empty','Nenhum nome encontrado.'));return;}
    matched.forEach(person=>results.append(personButton(person,person.generation+'ª geração · '+(person.branch?'Ramo '+person.branch:'Linhagem histórica'))));
  });
  document.getElementById('family-search-form').addEventListener('submit',event=>event.preventDefault());
  document.getElementById('family-back').addEventListener('click',()=>history.back());
  document.getElementById('family-origins').addEventListener('click',()=>select(all.find(person=>person.generation===1)));
  window.addEventListener('popstate',applyLocation);window.addEventListener('hashchange',applyLocation);applyLocation();
  window.NAVES_CHART={people:all,relationships,families:[...families.values()].map(unit=>({parents:unit.parents.map(p=>p.id),children:unit.children.map(p=>p.id)}))};
})();
