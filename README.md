# Fôlego · Finanças Serenas

Aplicativo estático de bem-estar financeiro familiar. Números para dormir tranquilo, não para se assustar.

## Rotas

Com `cleanUrls` ativado no `vercel.json`, todas as páginas respondem sem a extensão `.html`.

| Rota | Arquivo | O que entrega |
| --- | --- | --- |
| `/` | `index.html` | Painel com os Dias de Fôlego e o ritual familiar semanal |
| `/login` | `login.html` | Acesso acolhedor anti-ansiedade, com biometria e modo discreto |
| `/boas-vindas` | `boas-vindas.html` | Onboarding em 3 atos: passado sem culpa, presente seguro, futuro planejado |
| `/contas` | `contas.html` | Visão consolidada Open Finance e radar preventivo de vencimentos |
| `/orcamento` | `orcamento.html` | Orçamento colaborativo 50/30/20 com divisão proporcional à renda |
| `/metas` | `metas.html` | Mural de Sonhos de curto, médio e longo prazo |

Atalhos extras: `/inicio`, `/entrar`, `/onboarding` e `/sonhos` redirecionam para as rotas acima.

## Stack

- HTML estático, sem etapa de build
- Tailwind CSS via CDN, com paleta serena (`#2563eb` sobre `#f7f9fb`)
- Fonte Plus Jakarta Sans (Google Fonts)
- JavaScript puro para as interações: ritual semanal, biometria simulada, divisão proporcional do orçamento e simulador de aporte

## Rodar localmente

```bash
npx serve .
```

Sem servidor, os links sem extensão não resolvem: use `npx serve .` ou o deploy da Vercel.

## Deploy

```bash
vercel --prod
```

Os dados exibidos são fictícios e servem para demonstrar o produto.
