# Tema Ranger (produto SoftMotors)

Primeiro **tema** da plataforma SoftMotors para concessionárias multimarcas: site da loja +
estoque + publicação nos marketplaces (OLX, WebMotors, Mercado Livre) + leads em rodízio
entre vendedores, com multiloja. Escopo em [`docs/PRD.md`](docs/PRD.md).

**Separação empresa × produto:** a SoftMotors (software house) tem o próprio site no repo
`ojhondev/softmotors` / `A:\SoftMotors`. O **produto** vive aqui, um repositório por tema
(este é o `ojhondev/temaranger`). Não misturar código do produto no repo da empresa.

## Design (regra dura)

O storefront segue **exatamente** as referências em `design/referencias/`:
`home.png` (home), `filtro.png` (filtro lateral da busca) e `pdp.png` (página do veículo).
A home e a busca usam `HeaderHome`; a PDP usa `HeaderPdp` (menus suspensos), como nas
referências. Tokens em `src/app/globals.css` (`--color-ranger-*`, `--primary` #e3173e),
fontes Nunito Sans (texto) + Poppins (títulos/PDP). Componentes em `src/components/ranger/`,
textos editoriais (banners, carrocerias, taxa do "Ver parcelas") em `src/config/ranger.ts`.
Sem foto, o veículo aparece como ilustração SVG por carroceria (`src/components/car-image.tsx`);
`vehicles.photos` com URLs reais substitui automaticamente. Logos de marcas em `public/marcas/`.

## Stack

- Next.js 15.5 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui (estilo base-nova,
  sobre Base UI, não Radix) + lucide-react
- Neon (Postgres) + Drizzle ORM (`src/db/schema.ts`, migrations em `drizzle/`)
- Deploy: Vercel (projeto `temaranger`), repositório `github.com/ojhondev/temaranger`

## Mapa do código

- `src/app/(site)/`: storefront (home, `/estoque`, `/veiculo/[slug]`) + `actions.ts`
  (formulário da PDP e botões de WhatsApp/videochamada, todos geram lead)
- `src/app/torque/`: **Torque**, o painel admin da loja (nome do produto; a WebMotors chama o
  dela de Cockpit). Layout segue as referências do Cockpit (menu escuro, cards crm./estoque.
  com rosca, "Oportunidades de negócio"; CRM com fila comum e atividades do dia).
  - `(app)/`: Início, CRM (painel, leads, criar lead), Estoque (lista, cadastro com fotos),
    Marketplaces (assistente de 3 passos), Site (identidade, banners, página inicial,
    contato/WhatsApp, lojas), Equipe, Conta. `entrar/`: login.
  - `actions/`: server actions por módulo; toda ação chama `requireSession([...papéis])`.
- `src/lib/auth.ts` + `password.ts`: login e-mail/senha (scrypt), sessão JWT em cookie
  `torque_session` (`SESSION_SECRET`). Papéis: `master` (equipe SoftMotors, sem tenant, entra
  em qualquer loja), `manager` (gestor), `seller` (vendedor: só os próprios leads, estoque
  só leitura). `src/middleware.ts` só barra sem cookie; a checagem real é `getSession`.
- `src/lib/settings.ts`: configurações editáveis da loja (`tenants.settings` jsonb) com
  padrões do tema; `activeBanners` (tabela `banners`, cai nos padrões se vazia).
- `src/lib/tour.ts` + `components/torque/tour.tsx`: tours guiados (driver.js, mesmo modelo
  da Dattis): passos apontam para `data-tour="…"`, abrem sozinhos na 1ª visita de cada tela,
  vistos ficam em `users.tours_seen`. Tela nova no Torque = acrescentar tour aqui.
- `src/lib/tenant.ts`: resolve a concessionária pelo domínio ou `DEFAULT_TENANT`
- `src/lib/leads.ts`: criação de lead + rodízio de vendedores
- `src/lib/marketplaces.ts`: `MarketplaceAdapter` por portal (hoje **simulados**), contas em
  `marketplace_accounts` com regras ("todo o estoque"/faixa de preço); `applyAccountRules`
  e `syncMany` sincronizam em lote (pré-carregam veículos/anúncios; não iterar 1 a 1).
- Imagens: upload direto do navegador para o **Vercel Blob** (`/api/torque/upload`, store
  público `temaranger-midia`, pasta `lojas/{tenantId}/…`).
- Contas: `scripts/create-user.ts` (via env `TORQUE_EMAIL`/`TORQUE_PASSWORD`, nunca senha em
  arquivo); `scripts/seed-torque.ts` cria banners e portais do tenant demo.

## Regras

1. **Multi-tenant:** toda tabela tem `tenantId`; nenhuma query roda sem filtrar por ele.
2. **Zero código por cliente:** a diferença entre lojas é dado (cor, logo, domínio), nunca fork.
3. Integrações externas ficam atrás de interface, com mock no formato da API real primeiro.
4. As tabelas ficam no schema **`app`** do Postgres (`pgSchema`), em banco Neon próprio
   deste repo (não compartilhado com o site da empresa).
5. Migrations via `drizzle-kit`. O 1º SQL usa `CREATE SCHEMA IF NOT EXISTS "app"` porque
   o migrator cria o schema antes (o `drizzle-kit migrate` falha **calado** sem isso).
6. Cuidado ao gerar código por script Node com template string: `\\D` vira `D` e quebra
   regex (já aconteceu com o filtro de números e a validação de e-mail).

## Dev

- Dev server: preview `temaranger` (porta 3018, em `A:/Velo/.claude/launch.json`).
- Banco: `npm run db:generate` / `db:migrate` / `db:seed` (tenant `demo` "SoftMotors",
  2 lojas em São Paulo, 27 veículos incluindo 2 motos).
- `npx tsc --noEmit` + `npx eslint src` + `npm run build` antes de commitar. Não rodar
  `next build` com o `next dev` ativo (corrompe `.next`).

## Git: commit, push e deploy automáticos

Toda alteração de código feita neste projeto (nesta ou em sessões futuras) deve ser
commitada, enviada para o GitHub (`origin/main`) e publicada em produção
automaticamente, sem esperar autorização explícita a cada vez — isso já foi autorizado
pelo usuário.

Fluxo padrão ao concluir uma tarefa que altere código:
1. Rodar typecheck/build normalmente.
2. `git add -A`
3. `git commit -m "<mensagem descrevendo a mudança>"` (português, imperativo)
4. `git push origin main`
5. `npx vercel@latest --prod` — **obrigatório**, não presumir que o push sozinho
   publica a mudança (o auto-deploy nativo da Vercel já falhou silenciosamente neste
   tipo de projeto antes; ver `C:\Users\55149\dev.md` para o histórico).

Migrations pendentes (`npm run db:migrate`) são aplicadas no banco de destino nesta etapa.

## Regras do produto (decisões do fundador)

- **Temas são full width**: conteúdo ocupa a tela toda (sem container centralizado).
- O Torque precisa dar **liberdade total** à loja: tudo que aparece no site (banners, textos,
  logo, cores, WhatsApp, lojas, seções da home) é editável lá, sem depender da SoftMotors.
- **Marketplaces são o módulo primordial**: conectar um portal tem que caber em poucos
  cliques (hoje: 3 passos no assistente).

## Instalação de loja (modelo Shopify) e domínios

- **Um deploy, N lojas.** "Instalar o tema" para um cliente = criar a loja em
  Torque > **Clientes** (só master; `lib/provision.ts`): loja, 1ª unidade, gestor com senha
  provisória (mostrada uma vez) e banners padrão. Sem deploy por cliente.
- **Endereço da plataforma:** `{slug}.softmotors.com.br`. DNS do softmotors.com.br fica na
  **HostGator** com um CNAME curinga `*` → `cname.vercel-dns.com`; cada subdomínio é
  registrado no projeto Vercel na criação da loja (`lib/vercel-domains.ts`, wildcard de SSL
  não é possível com DNS fora da Vercel). `www` e outros nomes reservados não viram loja
  (`lib/platform.ts`). Resolução da loja: domínio próprio → subdomínio → `DEFAULT_TENANT`.
- **Domínio próprio:** a loja conecta em Site > **Domínio** (CNAME `www` + A na raiz
  `76.76.21.21`; sem www só redireciona). Verificação pela API da Vercel ou, sem token,
  por consulta de DNS direta.
- **Token:** `VERCEL_API_TOKEN` (criado pelo dono em vercel.com/account/tokens) +
  `VERCEL_PROJECT_ID`/`VERCEL_TEAM_ID`. Sem token, as telas mostram o comando
  `vercel domains add` para o master rodar.
- Sessão nos subdomínios usa cookie em `.softmotors.com.br` (master entra uma vez e abre o
  Torque de qualquer loja). Loja desativada (`tenants.active=false`): site 404, só master entra.
