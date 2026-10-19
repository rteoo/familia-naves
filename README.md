# 🌳 Família Naves — Genealogia Brasileira

Site interativo com a árvore genealógica e o mapa de migração da Família Naves no Brasil — **11 gerações documentadas, de 1624 até hoje**.

🔗 **[familia-naves.vercel.app](https://familia-naves.vercel.app)** 

---

## O que tem aqui

### Árvore Genealógica (`/arvore`)
- 10 gerações navegáveis com filtro por época
- Clique em qualquer pessoa para ver detalhes (nascimento, falecimento, local)
- Estética de pergaminho envelhecido
- Funciona offline — HTML puro, sem dependências

### Mapa de Migração (`/mapa`)
- Rota animada: **Portugal → São Paulo → Minas Gerais → Goiás**
- Linha do tempo interativa com contexto histórico por geração
- Clique nos locais do mapa ou nos itens da timeline para ativar cada etapa

---

## Estrutura do repositório

```
familia-naves/
├── index.html        # Página inicial com links para as duas visualizações
├── arvore.html       # Árvore genealógica interativa
├── mapa.html         # Mapa de migração com timeline
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

## Linha de descendência principal

| Geração | Nome | Período | Local |
|---------|------|---------|-------|
| 1ª | João de Almeida Naves + Maria da Silva Leite | c. 1653 | São Paulo, SP |
| 2ª | Florência da Silva Naves + Domingos Lopes da Silva | c. 1676 | Santana de Parnaíba, SP |
| 3ª | Luzia Moreira da Fonseca + José Vieira da Cunha | c. 1715 | Lavras, MG |
| 4ª | João Naves Damasceno + Anna Vittoria de São Thomé | c. 1760 | Lavras, MG |
| 5ª | Manoel Antônio Naves + Anna Rosa Sampaio | c. 1805 | Bom Sucesso, MG |
| 6ª | Umbelina Rosa Naves + Francisco de Paula Naves | c. 1831 | Bom Sucesso, MG |
| 7ª | Américo Brasiliense Naves | c. 1868 | Uberlândia, MG |
| 8ª | Messias Brasiliense Naves | c. 1883 | Uberlândia → Morrinhos, GO |
| 9ª | Anésia Naves + Antônio Alves da Silva | c. 1925 | Morrinhos → Quirinópolis, GO |
| 10ª | Gilmar Alves da Silva | 1958 | Quirinópolis, GO |
| 11ª | Fábio, Bruno e Rodrigo | 1985–1990 | Goiânia/Quirinópolis, GO |

---

## Fontes

- Boletim **"Notícias de Naves"** — Goiânia, GO (edições 142, 251, 257)
- Cartório de Órfãos de Parnaíba — inventário nº 473 (João de Almeida Naves)
- Lênio Luiz Richa — *"Almeida Naves"*, Genealogia Brasileira, *Os Títulos Perdidos*
- [familiaresnaves.blogspot.com.br](http://familiaresnaves.blogspot.com.br)

---

## Créditos

**Pesquisa:** Nilson N. Naves  
**Criação original:** Jales Naves  
**Editora Naves, 2025**

## Design system

The site uses **Teô Design System v2.7.1**, vendored under `assets/teo/`.
See [DESIGN.md](DESIGN.md) for the release source and project-specific extensions.
All pages support dark and light themes through the “Tema claro / Tema escuro”
button, with the choice retained across pages. No build or package installation is required.
