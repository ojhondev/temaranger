# SoftMotors — PRD v0

**Plataforma para concessionárias multimarcas:** site da loja + estoque + publicação nos
marketplaces + leads distribuídos entre vendedores. Um produto fechado, igual para todas as
lojas; o que muda de uma para outra é configuração.

- **Data:** 2026-10-11
- **Cliente:** concessionária/revenda multimarca, com uma ou várias lojas e vários vendedores
- **Promessa:** "cadastre o carro uma vez; ele aparece no seu site e em todos os portais, e
  cada lead cai no vendedor certo."

---

## Funcionalidades

### 1. Site da concessionária
- Home, estoque com filtros (marca, ano, preço, km, loja) e página do veículo.
- Botão de WhatsApp em cada carro, abrindo a conversa com o vendedor do rodízio.
- Formulário "tenho interesse" na página do veículo.
- Logo, cor e domínio de cada loja, sem código.

### 2. Estoque
- Cadastro do veículo (placa, marca, modelo, versão, ano, km, preço, cor, câmbio,
  combustível, loja) com preço FIPE de referência.
- Fotos.
- Status: **disponível · reservado · vendido**.

### 3. Marketplaces
- Liga/desliga a publicação de cada carro em **OLX, WebMotors e Mercado Livre**.
- Alterou o carro → anúncio atualizado. Vendido → sai de todos os portais e do site.

### 4. Leads
- Caixa única com os leads do site e dos portais, com carro de interesse e canal de origem.
- Status: novo · em atendimento · ganho · perdido.

### 5. Vendedores e lojas
- Várias lojas por cliente; cada carro pertence a uma loja.
- Vários vendedores; lead distribuído em **rodízio** entre os vendedores ativos da loja do carro.
- Papéis: **gestor** (vê tudo) e **vendedor** (vê só os seus leads).

### 6. Painel do dono
- Leads por canal e por vendedor.
- Carros parados há mais de 30 / 60 / 90 dias.

## Fora do v0
Financiamento, nota fiscal, contratos, comissões, app nativo, blog e SEO avançado.

---

## Como é construído

- **Multi-tenant:** cada concessionária é um `tenant`; toda tabela tem `tenantId`.
- **Integrações atrás de interface:** cada portal implementa `MarketplaceAdapter`
  (`publish`, `update`, `unpublish`). No v0 os adaptadores são **simulados**. Os reais
  dependem do credenciamento como integrador em cada portal (Mercado Livre tem API aberta;
  OLX e WebMotors exigem parceria).
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind 4 + shadcn/ui + Neon (Postgres)
  + Drizzle + Vercel.

## Próximos passos
1. Login real de gestor e vendedor (hoje o painel tem uma senha única).
2. Iniciar o credenciamento de integrador em OLX e WebMotors; integrar o Mercado Livre de verdade.
3. Upload de fotos (hoje são placeholders) e consulta FIPE/placa real.
4. Primeiro cliente piloto.
