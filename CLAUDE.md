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
- `src/app/painel/`: painel do gestor (visão geral, estoque, leads, vendedores) + `actions.ts`
- `src/lib/tenant.ts`: resolve a concessionária pelo domínio ou `DEFAULT_TENANT`
- `src/lib/leads.ts`: criação de lead + rodízio de vendedores
- `src/lib/marketplaces.ts`: `MarketplaceAdapter` por portal (hoje simulados) + `syncVehicle`
- `src/middleware.ts`: senha única do painel (`PAINEL_PASSWORD`, Basic Auth), provisória

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
