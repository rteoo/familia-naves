# 🌳 Família Naves — Genealogia Brasileira

Site estático da Família Naves: seis ramos de Anésia com parentescos confirmados pela família, linhagem histórica em revisão e mapa ilustrativo das migrações.

🔗 **[familia-naves.vercel.app](https://familia-naves.vercel.app)** 

---

## O que tem aqui

### Árvore Genealógica (`/arvore`)
- Árvore tradicional com a linhagem histórica e os seis ramos de Anésia, em 13 gerações disponíveis
- Caixas individuais, linhas de parentesco, casamentos e vínculos incertos diferenciados
- Zoom, visão geral, atalhos para família/origens, busca por nome e filtro de ramo; buscas ignoram acentos
- Parentescos, cônjuges, relacionamentos anteriores e falecidos identificados
- Fontes familiares separadas das alegações históricas
- `/linhagem` mantém a pesquisa histórica com divergências explícitas
- Sem build, instalação de pacotes ou serviços externos em tempo de execução

### Mapa de Migração (`/mapa`)
- Rota ilustrativa: **Portugal → São Paulo → Minas Gerais → Goiás**
- Linha do tempo interativa com contexto histórico por geração
- Clique nos locais do mapa ou nos itens da timeline para ativar cada etapa

---

## Estrutura do repositório

```
familia-naves/
├── index.html        # Página inicial, ramos, encontro e fontes
├── familia.html      # /arvore: seis ramos de Anésia
├── arvore_naves.html # /linhagem: compilação histórica em revisão
├── mapa_migracao_naves.html # /mapa: mapa e linha do tempo
├── vercel.json       # Configuração de rotas do Vercel
└── README.md
```

---

## Deploy

Hospedado no **Vercel** com deploy automático a cada push na branch `main`.

Para rodar localmente com as mesmas rotas do Vercel, execute `python3 serve.py`
na raiz do repositório e abra a porta 8000 no navegador. Requer apenas Python 3;
sem instalação de pacotes ou build. Use `--port 8001` para escolher outra porta.

---

## Linha de descendência na compilação histórica

Esta tabela resume a compilação e não autentica seus vínculos. As divergências
de identidade, datas e localidades aparecem na página `/linhagem`.

| Geração | Nome | Período | Local |
|---------|------|---------|-------|
| 1ª | João de Almeida Naves + Maria da Silva Leite | c. 1653 | São Paulo, SP |
| 2ª | Florência da Silva Naves + Domingos Lopes da Silva | c. 1676 | Santana de Parnaíba, SP |
| 3ª | João de Almeida Naves (neto) + Luzia Moreira da Fonseca | c. 1715 | Lavras, MG |
| 4ª | João Naves Damasceno + Anna Vittoria de São Thomé | c. 1760 | Lavras, MG |
| 5ª | Manoel Antônio Naves + Anna Rosa Sampaio | c. 1805 | Bom Sucesso, MG |
| 6ª | Umbelina Rosa Naves + Francisco de Paula Naves | c. 1831 | Bom Sucesso, MG |
| 7ª | Américo Brasiliense Naves | c. 1868 | Uberlândia, MG |
| 8ª | Messias Brasiliense Naves | c. 1883 | Uberlândia → Morrinhos, GO |
| 9ª | Anésia Naves + Antônio Alves da Silva | 1932 / 1926 | Morrinhos → Quirinópolis, GO |
| 10ª | Gilmar Alves da Silva | 1958 | Quirinópolis, GO |
| 11ª | Fábio, Brunno e Rodrigo | 1985–1990 | Goiânia/Quirinópolis, GO |

---

## Fontes

- Boletim **"Notícias de Naves"** — Goiânia, GO (edições 142, 251, 257)
- Cartório de Órfãos de Parnaíba — inventário nº 473 (João de Almeida Naves)
- Lênio Luiz Richa — *"Almeida Naves"*, Genealogia Brasileira, *Os Títulos Perdidos*
- [Blog do Jales / Editora Naves](https://editoranaves.com.br/)
- Confirmações familiares recebidas em 11.11.2026; notas locais em `sources/` (pasta ignorada pelo Git). O site apresenta os vínculos fornecidos sem considerar a lista comprovadamente exaustiva.

---

## Créditos

**Pesquisa:** Nilson N. Naves  
**Criação original:** Jales Naves  
**Editora Naves, 2025**

## Interface

The site has its own genealogical atlas identity: cobalt diagrams, warm paper,
large typography and numbered family chapters. It loads no shared design system.
Presentation lives in `assets/atlas.css`; typography uses local system fonts.
Paper is the default, with an optional dark appearance retained across routes.

Browser checks: `node scripts/check-site.mjs` uses an existing Chrome installation
and Node 22+; no npm packages are needed. Set `CHROME_PATH` if Chrome is elsewhere.
The check starts an isolated local server and browser profile and cleans both up.
It exercises family relationships, search, filters, route navigation, themes,
historical generation navigation, map selection and responsive overflow.
