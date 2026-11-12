/* Family testimony supplied 2026-11-11; historical claims remain separate. */
(() => {
  const p = (name, note = '', children = [], deceased = false) => ({name, note, children, deceased});
  const branches = [
    {id:'neuza',name:'Neuza',note:'Casada com Ossualdo.',children:[
      p('Ossualdo Júnior','Atualmente casado com Leidiana.',[p('Polyana','',[p('Pedro')]),p('Jean'),p('Mayk','',[p('Bento')]),p('Marlon','',[p('Manuela'),p('Miguel')])]),
      p('Leandro','Casado com Andreia.',[p('Isadora')]),p('Carla Bianca','Casada com Itanel.',[p('Gustavo','Filho de Carla Bianca e Itanel.'),p('Rafaela','Filha de Carla Bianca e Itanel.')])]},
    {id:'neyde',name:'Neyde',note:'Atualmente casada com Edilson. A paternidade de Juliano e Luciano não foi indicada nesta atualização.',children:[p('Juliano','',[],true),p('Luciano','Casado com Franciele.',[p('Yasmin','Filha de Luciano e Denise, do casamento anterior.'),p('Artur','Filho de Luciano e Franciele.'),p('Heitor','Filho de Luciano e Franciele.'),p('Rafael','Filho de Luciano e Franciele.')])]},
    {id:'gilberto',name:'Gilberto',note:'Cristiane é filha do casamento com Olga. A mãe de Gilberto Filho não foi indicada nesta atualização.',children:[p('Cristiane','Filha de Gilberto e Olga.',[p('Rogério'),p('Rubem')]),p('Gilberto Filho','',[p('Kallyan')])]},
    {id:'nilza',name:'Nilza',note:'Casada com Edmo.',children:[p('Leonardo','',[p('Mateus'),p('Victor')],true),p('Eduardo','',[p('Manuela'),p('Rafaela')]),p('Viviane','Casada com Alexandre.',[p('Gabriel','Filho de Viviane e Fabrício, de relacionamento anterior.'),p('Laura','Filha de Viviane e Alexandre.'),p('Pedro','Filho de Viviane e Alexandre.')])]},
    {id:'nilda',name:'Nilda',note:'Foi casada com João; atualmente divorciada.',children:[p('Waleska','Casada com Wagner.',[p('Lukas','Filho de Waleska, de relacionamento anterior.'),p('Mariana','Filha de Waleska e Wagner.')]),p('Rafael','',[p('João Antonio'),p('Stella')])]},
    {id:'gilmar',name:'Gilmar',note:'Casado com Zélia. Rodrigo e Brunno são filhos de Zélia.',children:[p('Fábio','Casado com Paloma.',[p('João Pedro','Filho de Fábio e Nachima, de relacionamento anterior.'),p('Theo','Filho de Fábio e Paloma.'),p('Lara','Filha de Fábio e Paloma.')]),p('Rodrigo','Filho de Gilmar e Zélia. Casado com Ana Cristhina. Natural de Goiânia.'),p('Brunno','Filho de Gilmar e Zélia. Casado com Raphaela. Natural de Goiânia.',[p('Maitê'),p('Antônio')])]}
  ];
  window.NAVES_FAMILY = branches;
})();
