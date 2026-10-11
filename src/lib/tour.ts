// Tours guiados do Torque (mesmo modelo da Dattis). Cada passo aponta para um elemento com
// data-tour="..."; sem alvo (ou com o alvo escondido), o passo aparece centralizado.
// Linguagem de dono de loja: o que é, por que importa, onde clicar.

export type TourStep = { target?: string; title: string; text: string; side?: "top" | "right" | "bottom" | "left" };
export type Tour = { id: string; name: string; route: (p: string) => boolean; steps: TourStep[] };

const nav = (href: string) => `nav:${href}`;

export const TOURS: Tour[] = [
  {
    id: "boas-vindas",
    name: "Tour completo do Torque",
    route: (p) => p === "/torque",
    steps: [
      {
        title: "Bem-vindo ao Torque",
        text: "Este é o painel da sua loja. Daqui você cuida de <b>tudo</b>: estoque, leads, anúncios nos portais e o próprio site. Nada depende da SoftMotors. Em 1 minuto você conhece cada parte.",
      },
      {
        target: "card-crm",
        title: "Seus leads num lugar só",
        text: "Quantos contatos chegaram no mês e de onde (site, WhatsApp, OLX, WebMotors, Mercado Livre). O aviso azul mostra quem ainda está <b>sem resposta</b>.",
        side: "bottom",
      },
      {
        target: "card-estoque",
        title: "Estoque e anúncios",
        text: "Quantos carros você tem, quantos estão publicados nos portais e quantos ainda não foram anunciados. Anúncio com erro aparece em vermelho.",
        side: "bottom",
      },
      {
        target: "card-marketplaces",
        title: "Marketplaces em poucos cliques",
        text: "Conecte OLX, WebMotors e Mercado Livre uma vez: depois cada carro cadastrado é anunciado sozinho, e o vendido sai de todos.",
        side: "bottom",
      },
      {
        target: nav("/torque/site"),
        title: "O site é seu",
        text: "Logo, cores, banners de ofertas, textos da página inicial, WhatsApp e lojas: tudo editável aqui, sem pedir para ninguém.",
        side: "right",
      },
      {
        target: nav("/torque/equipe"),
        title: "Equipe e rodízio",
        text: "Cadastre vendedores e gestores. Os leads de cada carro vão em <b>rodízio</b> para os vendedores da loja dele.",
        side: "right",
      },
      {
        target: "ajuda",
        title: "Dúvida? Central de ajuda",
        text: "Reveja qualquer tour, consulte o glossário e fale com a SoftMotors.",
        side: "right",
      },
    ],
  },
  {
    id: "crm",
    name: "Painel do CRM",
    route: (p) => p === "/torque/crm",
    steps: [
      {
        target: "fila",
        title: "Fila comum de atendimento",
        text: "Cada lead novo vai para o vendedor que está há mais tempo sem receber. Aqui você acompanha quem está atendendo, quem está devendo resposta e a conversão de cada um.",
        side: "bottom",
      },
      {
        target: "atividades",
        title: "Atividades do dia",
        text: "Os clientes esperando resposta, do mais antigo para o mais novo. Clique em <b>Responder</b> para abrir o WhatsApp do cliente.",
        side: "left",
      },
      {
        target: "novo-lead",
        title: "Lead que chegou por telefone ou na loja",
        text: "Registre aqui para entrar na fila e nos relatórios.",
        side: "bottom",
      },
    ],
  },
  {
    id: "leads",
    name: "Lista de leads",
    route: (p) => p === "/torque/crm/leads",
    steps: [
      { target: "leads-filtros", title: "Filtre do jeito que quiser", text: "Por status, canal de origem ou vendedor.", side: "bottom" },
      {
        target: "leads-lista",
        title: "Atualize o andamento",
        text: "Mude o status (novo, em atendimento, ganho, perdido) e, se precisar, passe o lead para outro vendedor. O número do cliente abre direto no WhatsApp.",
        side: "top",
      },
    ],
  },
  {
    id: "estoque",
    name: "Estoque",
    route: (p) => p === "/torque/estoque",
    steps: [
      { target: "estoque-novo", title: "Cadastrar veículo", text: "Fotos, ficha, opcionais e preço. Ao salvar, o carro entra no site e nos portais conectados.", side: "bottom" },
      {
        target: "estoque-tabela",
        title: "Tudo de cada carro",
        text: "Status, dias no pátio (vermelho = parado há mais de 60 dias) e em quais portais está anunciado. Clique no carro para editar.",
        side: "top",
      },
    ],
  },
  {
    id: "veiculo",
    name: "Cadastro de veículo",
    route: (p) => /^\/torque\/estoque\/(novo|\d+)$/.test(p),
    steps: [
      { target: "fotos", title: "Fotos vendem o carro", text: "Arraste várias de uma vez. A primeira é a capa; use as setas para reordenar.", side: "bottom" },
      { target: "ficha", title: "Ficha e preço", text: "Os campos com * são obrigatórios. O preço FIPE é usado para o selo de oportunidade.", side: "top" },
      { target: "vitrine", title: "Destaque e selo", text: "Marque <b>Destaque</b> para o carro aparecer primeiro, e use o selo (ex.: “Festival de carros”) nas campanhas.", side: "top" },
    ],
  },
  {
    id: "marketplaces",
    name: "Marketplaces",
    route: (p) => p === "/torque/marketplaces",
    steps: [
      {
        target: "portais",
        title: "Conecte cada portal uma vez",
        text: "Clique em <b>Conectar</b>, autorize a conta da loja e escolha o que publicar. São 3 passos. A partir daí os anúncios são criados, atualizados e removidos sozinhos.",
        side: "bottom",
      },
      { target: "resumo-portais", title: "Acompanhe os resultados", text: "Anúncios ativos e leads de cada portal, lado a lado.", side: "top" },
    ],
  },
  {
    id: "site",
    name: "Identidade do site",
    route: (p) => p === "/torque/site",
    steps: [
      { target: "site-abas", title: "O site inteiro em abas", text: "Identidade, banners, página inicial, contato e lojas. Tudo que você salvar aparece no site na hora.", side: "bottom" },
      { target: "site-logo", title: "Logo e cor da marca", text: "Suba o logo em PNG ou SVG e escolha a cor principal: botões, preços e destaques mudam juntos.", side: "bottom" },
    ],
  },
  {
    id: "banners",
    name: "Banners",
    route: (p) => p === "/torque/site/banners",
    steps: [
      { target: "banner-novo", title: "Banner de oferta novo", text: "Suba a imagem (ideal 1600×500), escreva o título e para onde o botão leva.", side: "bottom" },
      { target: "banner-lista", title: "Ordem e vitrine", text: "Use as setas para mudar a ordem e o botão para tirar do ar sem apagar.", side: "top" },
    ],
  },
  {
    id: "equipe",
    name: "Equipe",
    route: (p) => p === "/torque/equipe",
    steps: [
      { target: "equipe-lista", title: "Quem atende e quem acessa", text: "Vendedor no rodízio recebe leads. Com e-mail e senha, a pessoa também entra no Torque e vê só os próprios leads.", side: "top" },
    ],
  },
];

export const GLOSSARY = [
  { term: "Lead", meaning: "Um cliente interessado: alguém que mandou mensagem, chamou no WhatsApp ou pediu contato por um portal." },
  { term: "Fila comum (rodízio)", meaning: "Cada lead novo vai para o vendedor ativo da loja do carro que está há mais tempo sem receber." },
  { term: "Marketplace / portal", meaning: "Sites como OLX, WebMotors e Mercado Livre, onde seus carros são anunciados além do seu próprio site." },
  { term: "Anúncio com erro", meaning: "O portal recusou o anúncio (foto faltando, dado inválido). Abra o carro no Estoque para corrigir." },
  { term: "Destaque", meaning: "O carro aparece primeiro no site e ganha o selo roxo “Destaque”." },
  { term: "Carro parado", meaning: "Veículo há mais de 60 dias no estoque. Vale rever preço, fotos ou fazer campanha." },
];

export const tourForRoute = (pathname: string) => TOURS.find((t) => t.route(pathname));
