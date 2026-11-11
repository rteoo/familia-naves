/* Family testimony supplied 2026-11-11; historical claims remain separate. */
(() => {
  const p = (name, note = '', children = [], deceased = false) => ({name, note, children, deceased});
  const branches = [
    {id:'neuza',name:'Neuza',note:'Casada com Ossualdo.',children:[
      p('Ossualdo Júnior','Atualmente casado com Leidiana.',[p('Polyana','',[p('Pedro')]),p('Jean'),p('Mayk','',[p('Bento')]),p('Marlon','',[p('Manuela'),p('Miguel')])]),
      p('Leandro','Casado com Andreia.',[p('Isadora')]),p('Carla Bianca','Casada com Itanel.',[p('Gustavo'),p('Rafaela')])]},
    {id:'neyde',name:'Neyde',note:'Atualmente casada com Edilson. A paternidade de Juliano e Luciano não foi indicada nesta atualização.',children:[p('Juliano','',[],true),p('Luciano','Casado com Franciele.',[p('Yasmin','Filha de Luciano e Denise, do casamento anterior.'),p('Artur','Filho de Luciano e Franciele.'),p('Heitor','Filho de Luciano e Franciele.'),p('Rafael','Filho de Luciano e Franciele.')])]},
    {id:'gilberto',name:'Gilberto',note:'Cristiane é filha do casamento com Olga. A mãe de Gilberto Filho não foi indicada nesta atualização.',children:[p('Cristiane','Filha de Gilberto e Olga.',[p('Rogério'),p('Rubem')]),p('Gilberto Filho','',[p('Kallyan')])]},
    {id:'nilza',name:'Nilza',note:'Casada com Edmo.',children:[p('Leonardo','',[p('Mateus'),p('Victor')],true),p('Eduardo','',[p('Manuela'),p('Rafaela')]),p('Viviane','Casada com Alexandre.',[p('Gabriel','Filho de Viviane e Fabrício, de relacionamento anterior.'),p('Laura','Filha de Viviane e Alexandre.'),p('Pedro','Filho de Viviane e Alexandre.')])]},
    {id:'nilda',name:'Nilda',note:'Foi casada com João; atualmente divorciada.',children:[p('Waleska','Casada com Wagner.',[p('Lukas','Filho de Waleska, de relacionamento anterior.'),p('Mariana','Filha de Waleska e Wagner.')]),p('Rafael','',[p('João Antonio'),p('Stella')])]},
    {id:'gilmar',name:'Gilmar',note:'Casado com Zélia. Rodrigo e Brunno são filhos de Zélia.',children:[p('Fábio','Casado com Paloma.',[p('João Pedro','Filho de Fábio e Nachima, de relacionamento anterior.'),p('Theo','Filho de Fábio e Paloma.'),p('Lara','Filha de Fábio e Paloma.')]),p('Rodrigo','Filho de Gilmar e Zélia. Casado com Ana Cristhina. Natural de Goiânia.'),p('Brunno','Filho de Gilmar e Zélia. Casado com Raphaela. Natural de Goiânia.',[p('Maitê'),p('Antônio')])]}
  ];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const input = document.getElementById('person-search');
  const select = document.getElementById('branch-filter');
  const root = document.getElementById('family-tree');
  const levels = ['Neto(a) de Anésia','Bisneto(a) de Anésia','Tataraneto(a) de Anésia'];
  function personNode(person, depth, query) {
    const li = document.createElement('li');
    const name = document.createElement(query && normalize(person.name).includes(query) ? 'mark' : 'span');
    name.className = 'person-name'; name.textContent = person.name; li.append(name);
    if (person.deceased) { const tag = document.createElement('span'); tag.className='deceased';tag.textContent='Falecido';li.append(tag); }
    const level = document.createElement('div');level.className='person-detail';level.textContent=levels[depth];li.append(level);
    if (person.note) {const note=document.createElement('div');note.className='person-note';note.textContent=person.note;li.append(note);}
    if(person.children.length) {const list=document.createElement('ul');person.children.forEach(child=>list.append(personNode(child,depth+1,query)));li.append(list);}
    return li;
  }
  const contains = (person, query) => normalize(`${person.name} ${person.note}`).includes(query) || person.children.some(child=>contains(child,query));
  function render() {
    const query=normalize(input.value);root.replaceChildren();let visible=0;
    branches.forEach(branch=>{
      if(select.value && select.value!==branch.id)return;
      if(query && !normalize(`${branch.name} ${branch.note}`).includes(query) && !branch.children.some(person=>contains(person,query)))return;
      visible++;
      const section=document.createElement('section');section.id=branch.id;section.className='family-branch';
      const head=document.createElement('div');head.className='branch-head';
      const heading=document.createElement('h2');heading.id=`heading-${branch.id}`;heading.textContent=branch.name;section.setAttribute('aria-labelledby',heading.id);
      const note=document.createElement('p');note.textContent=branch.note;head.append(heading,note);section.append(head);
      const list=document.createElement('ul');list.className='descendants';branch.children.forEach(person=>list.append(personNode(person,0,query)));section.append(list);root.append(section);
    });
    document.getElementById('empty').hidden=visible!==0;
    document.getElementById('tree-status').textContent=`${visible} ${visible===1?'ramo exibido':'ramos exibidos'}${query?' · A busca mantém o ramo completo para preservar o parentesco.':''}`;
  }
  input.addEventListener('input',render);select.addEventListener('change',render);
  document.getElementById('tree-search').addEventListener('submit',event=>event.preventDefault());
  document.getElementById('tree-search').addEventListener('reset',()=>{input.value='';select.value='';render();});
  render();
  function openBranch(){const id=location.hash.slice(1);const section=document.getElementById(id);if(section)section.scrollIntoView({behavior:'instant',block:'start'});}
  document.fonts.ready.then(openBranch);
  window.addEventListener('hashchange',()=>{input.value='';select.value='';render();openBranch();});
})();
