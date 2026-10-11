# SoftMotors

Plataforma para concessionárias multimarcas: **site da loja + estoque + publicação nos
marketplaces (OLX, WebMotors, Mercado Livre) + leads em rodízio entre vendedores**, com
multiloja. Produto fechado, igual para todas as lojas. Escopo enxuto, ver
[`docs/PRD.md`](docs/PRD.md) (v0, recomeçado do zero em 2026-10-11).

## Stack

- Next.js 15.5 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui (estilo base-nova,
  sobre Base UI, não Radix) + lucide-react
- Neon (Postgres) + Drizzle ORM (`src/db/schema.ts`, migrations em `drizzle/`)
- Deploy: Vercel, repositório `github.com/ojhondev/softmotors`

## Mapa do código

- `src/app/(site)/`: site público (home, `/estoque`, `/veiculo/[slug]`) + `actions.ts`
  (form de interesse e botão de WhatsApp, os dois geram lead)
- `src/app/painel/`: painel do gestor (visão geral, estoque, leads, vendedores) + `actions.ts`
- `src/lib/tenant.ts`: resolve a concessionária pelo domínio ou `DEFAULT_TENANT`
- `src/lib/leads.ts`: criação de lead + rodízio de vendedores
- `src/lib/marketplaces.ts`: `MarketplaceAdapter` por portal (hoje simulados) + `syncVehicle`
- `src/middleware.ts`: senha única do painel (`PAINEL_PASSWORD`, Basic Auth), provisória

## Regras

1. **Multi-tenant:** toda tabela tem `tenantId`; nenhuma query roda sem filtrar por ele.
2. **Zero código por cliente:** a diferença entre lojas é dado (cor, logo, domínio), nunca fork.
3. Integrações externas ficam atrás de interface, com mock no formato da API real primeiro.
4. As tabelas ficam no schema **`app`** do Postgres (`pgSchema`). O schema `public` ainda
   tem as tabelas do projeto antigo (tenants, units, vehicles, leads), sem uso; o
   classificador bloqueou removê-las, então só o usuário deve apagá-las.
5. Migrations via `drizzle-kit`. O 1º SQL usa `CREATE SCHEMA IF NOT EXISTS "app"` porque
   o migrator cria o schema antes (o `drizzle-kit migrate` falha **calado** sem isso).

## Dev

- Dev server: preview `softmotors` (porta 3007, em `A:/Velo/.claude/launch.json`).
- Banco: `npm run db:generate` / `db:migrate` / `db:seed` (tenant `demo` "Rota Veículos").
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
