/**
 * Conteúdo da Central de Ajuda (ajuda.softmotors.com.br). Um módulo por área do Torque.
 * Ao criar ou mudar uma função do Torque, atualize o artigo correspondente aqui.
 * Texto entre **asteriscos** sai em negrito.
 */

export type Block =
  | { p: string }
  | { h: string }
  | { steps: string[] }
  | { list: string[] }
  | { tip: string }
  | { warn: string };

export type Article = {
  slug: string;
  title: string;
  summary: string;
  /** Onde fica no Torque, ex.: "Site › Aparência". */
  where?: string;
  body: Block[];
};

export type HelpModule = {
  slug: string;
  title: string;
  description: string;
  icon: "rocket" | "gauge" | "messages" | "car" | "store" | "globe" | "link" | "users" | "smartphone" | "shield" | "book";
  articles: Article[];
};

export const MODULES: HelpModule[] = [
  {
    slug: "primeiros-passos",
    title: "Primeiros passos",
    description: "Acessar o Torque, conhecer o painel e configurar a loja no primeiro dia.",
    icon: "rocket",
    articles: [
      {
        slug: "o-que-e-o-torque",
        title: "O que é o Torque?",
        summary: "O painel da sua loja: estoque, leads, portais e o seu site num lugar só.",
        body: [
          { p: "O **Torque** é o painel de gestão da sua loja na plataforma SoftMotors. Tudo o que aparece no seu site e nos portais é controlado por ele, sem depender da SoftMotors." },
          { h: "O que você faz no Torque" },
          {
            list: [
              "**Estoque:** cadastrar carros e motos com fotos, preço e opcionais.",
              "**CRM:** receber e atender os leads do site, do WhatsApp e dos portais, distribuídos entre os vendedores.",
              "**Marketplaces:** anunciar o estoque na OLX, WebMotors e Mercado Livre sem cadastrar carro por carro.",
              "**Site:** trocar logo, cores, banners, textos, pop-up, WhatsApp e domínio.",
              "**Equipe:** cadastrar vendedores e gestores e definir quem acessa o painel.",
            ],
          },
          { tip: "Em qualquer tela, clique em **Posso ajudar?** no menu para fazer o tour guiado daquela parte do Torque." },
        ],
      },
      {
        slug: "como-acessar",
        title: "Como acessar o Torque?",
        summary: "Endereço do painel, login e o que fazer se esquecer a senha.",
        body: [
          { p: "O Torque fica no mesmo endereço do seu site, com **/torque** no final." },
          {
            steps: [
              "Abra o endereço do seu site e acrescente **/torque**. Exemplo: **sualoja.softmotors.com.br/torque** ou **www.sualoja.com.br/torque**.",
              "Informe o **e-mail** e a **senha** que você recebeu da SoftMotors (gestor) ou do gestor da loja (vendedor).",
              "Clique em **Entrar no Torque**.",
            ],
          },
          { tip: "No primeiro acesso, troque a senha provisória em **Conta › Trocar senha**." },
          { h: "Esqueci minha senha" },
          { p: "Peça ao gestor da loja para definir uma nova senha em **Equipe › Editar**. Se você é o gestor, fale com o suporte da SoftMotors." },
        ],
      },
      {
        slug: "primeiro-dia",
        title: "Checklist do primeiro dia",
        summary: "Os passos para deixar a loja pronta para vender.",
        body: [
          { p: "Siga esta ordem para colocar a loja no ar em poucas horas:" },
          {
            steps: [
              "**Site › Identidade:** envie o logo, o favicon e escolha a cor da loja.",
              "**Site › Lojas:** confira nome, cidade, endereço e WhatsApp de cada unidade.",
              "**Site › Contato e WhatsApp:** informe o WhatsApp principal, o telefone e as redes sociais.",
              "**Equipe:** cadastre os vendedores com o WhatsApp de cada um. Eles entram no rodízio de leads.",
              "**Estoque › Cadastrar veículo:** cadastre os carros com fotos.",
              "**Marketplaces:** conecte OLX, WebMotors e Mercado Livre.",
              "**Site › Banners:** troque os banners padrão pelos da sua loja.",
              "**Site › Domínio:** se a loja tem domínio próprio, conecte-o.",
            ],
          },
        ],
      },
      {
        slug: "tour-guiado",
        title: "Como usar os tours guiados?",
        summary: "Passo a passo dentro do próprio Torque, tela por tela.",
        body: [
          { p: "Cada área do Torque tem um tour que aponta, na própria tela, para que serve cada parte." },
          {
            steps: [
              "Abra a tela que quer conhecer (por exemplo, **Marketplaces**).",
              "Clique em **Posso ajudar?**, no rodapé do menu lateral.",
              "Siga os balões com **Próximo**. Feche quando quiser.",
            ],
          },
          { p: "O tour de cada tela abre sozinho na primeira visita. A **Central de ajuda** do menu tem o glossário e o atalho para falar com o suporte." },
        ],
      },
      {
        slug: "perfis-de-acesso",
        title: "Quais são os perfis de acesso?",
        summary: "O que o gestor e o vendedor podem fazer.",
        body: [
          {
            list: [
              "**Gestor:** acesso total à loja. Estoque, CRM de todos os vendedores, portais, site, domínio e equipe.",
              "**Vendedor:** vê e atende **só os próprios leads**, consulta o estoque (sem editar) e cria leads.",
            ],
          },
          { tip: "Vendedor sem senha não acessa o Torque, mas continua recebendo leads pelo WhatsApp no rodízio." },
        ],
      },
    ],
  },
  {
    slug: "inicio",
    title: "Painel inicial",
    description: "Os números do mês, avisos e atalhos da tela de entrada.",
    icon: "gauge",
    articles: [
      {
        slug: "entendendo-o-painel",
        title: "Como ler o painel inicial?",
        summary: "Leads do mês, estoque, portais e o endereço do seu site.",
        where: "Início",
        body: [
          { p: "A tela **Início** resume a loja em cartões:" },
          {
            list: [
              "**crm.** Leads recebidos no mês, por canal, e quantos esperam resposta.",
              "**estoque.** Veículos publicados nos portais, só no site e reservados.",
              "**marketplaces.** Portais conectados e anúncios com erro.",
              "**site.** O endereço do site e atalhos para editar.",
              "**Oportunidades de negócio:** sugestões do que ativar para vender mais.",
            ],
          },
          { tip: "O sino no topo mostra avisos importantes: leads sem resposta, anúncios com erro e carros parados há mais de 60 dias." },
        ],
      },
    ],
  },
  {
    slug: "crm",
    title: "CRM e leads",
    description: "Receber, distribuir e atender os contatos dos clientes.",
    icon: "messages",
    articles: [
      {
        slug: "como-funciona-o-rodizio",
        title: "Como os leads são distribuídos entre os vendedores?",
        summary: "O rodízio automático entrega cada lead ao próximo vendedor da vez.",
        body: [
          { p: "Todo contato vira um **lead** e vai automaticamente para um vendedor, em **rodízio**:" },
          {
            steps: [
              "O cliente envia mensagem, chama no WhatsApp ou liga a partir do site, ou chega por um portal.",
              "O Torque escolhe o vendedor **ativo** da loja do carro que está há mais tempo sem receber lead.",
              "Se a loja do carro não tem vendedor, o lead vai para qualquer vendedor ativo.",
              "No WhatsApp, o cliente já cai na conversa com o vendedor escolhido.",
            ],
          },
          { tip: "Para tirar alguém do rodízio (férias, folga), use **Desativar** em **Equipe**." },
        ],
      },
      {
        slug: "painel-do-crm",
        title: "O que mostra o painel do CRM?",
        summary: "Fila de atendimento, negociações e taxa de conversão.",
        where: "CRM › Painel",
        body: [
          {
            list: [
              "**Leads sem resposta:** clientes esperando o primeiro contato.",
              "**Negociações em andamento:** leads marcados como em atendimento.",
              "**Taxa de conversão:** leads ganhos sobre o total do período.",
              "**Fila do rodízio:** quem recebe o próximo lead.",
              "**Funil:** quantos leads estão em cada etapa.",
            ],
          },
        ],
      },
      {
        slug: "atender-um-lead",
        title: "Como atender e mudar o status de um lead?",
        summary: "Novo, em atendimento, ganho ou perdido.",
        where: "CRM › Leads",
        body: [
          {
            steps: [
              "Abra **CRM › Leads**.",
              "Use os filtros de **status**, **canal** e **vendedor** para achar o lead.",
              "Fale com o cliente pelo WhatsApp, telefone ou e-mail mostrados no card.",
              "Escolha o novo status (**Em atendimento**, **Ganho** ou **Perdido**) e clique em **Salvar**.",
            ],
          },
          { p: "O gestor vê os leads de todos os vendedores. O vendedor vê só os dele." },
        ],
      },
      {
        slug: "criar-lead-manual",
        title: "Como registrar um lead que chegou por telefone ou na loja?",
        summary: "Cadastre o contato manualmente para ele entrar no CRM.",
        where: "CRM › Criar lead",
        body: [
          {
            steps: [
              "Abra **CRM › Criar lead**.",
              "Preencha o **Nome do cliente** e, se tiver, WhatsApp e e-mail.",
              "Em **Como chegou**, escolha o canal.",
              "Escolha o **Veículo de interesse** (ou deixe **Nenhum específico**).",
              "Clique em salvar. O lead entra no rodízio como os demais.",
            ],
          },
        ],
      },
      {
        slug: "de-onde-vem-os-leads",
        title: "De onde vêm os leads?",
        summary: "Site, WhatsApp, pop-up, OLX, WebMotors, Mercado Livre e manual.",
        body: [
          {
            list: [
              "**Site:** formulário da página do veículo, botão Ligar e pop-up de captação.",
              "**WhatsApp:** botão de WhatsApp da página do veículo e da videochamada.",
              "**Portais:** mensagens recebidas na OLX, WebMotors e Mercado Livre.",
              "**Manual:** leads criados pela equipe em **CRM › Criar lead**.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "estoque",
    title: "Estoque",
    description: "Cadastrar, editar, reservar e vender veículos.",
    icon: "car",
    articles: [
      {
        slug: "cadastrar-veiculo",
        title: "Como cadastrar um veículo?",
        summary: "Ficha, fotos, opcionais e preço. Ao salvar, o carro vai para o site e os portais.",
        where: "Estoque › Cadastrar veículo",
        body: [
          {
            steps: [
              "Abra **Estoque › Cadastrar veículo**.",
              "Arraste as fotos para a área de fotos ou clique em **Adicionar fotos**. A primeira é a capa; use as setas para reordenar.",
              "Preencha a **Ficha do veículo**: tipo, loja, marca, modelo, versão, anos, quilometragem, câmbio, combustível e cor.",
              "Informe o **Preço** e, se quiser, a **Tabela FIPE** (usada na comparação de preço do site).",
              "Marque os **Itens e opcionais** e escreva a descrição.",
              "Em **Vitrine e diferenciais**, marque Destaque, Aceita troca, Garantia de fábrica, Histórico veicular ou um Selo de campanha.",
              "Clique em **Cadastrar veículo**.",
            ],
          },
          { p: "O carro aparece no site na hora e, se algum portal estiver conectado com **Todo o estoque**, é anunciado nele automaticamente." },
          { tip: "Fotos horizontais (4:3), boa luz e o carro inteiro no quadro vendem mais. Use de 8 a 20 fotos." },
        ],
      },
      {
        slug: "reservar-ou-vender",
        title: "Como marcar um carro como reservado ou vendido?",
        summary: "O status pausa ou tira os anúncios de todos os portais.",
        where: "Estoque › veículo › Status",
        body: [
          {
            steps: [
              "Em **Estoque**, clique no veículo.",
              "No quadro **Status**, clique em **Reservado** ou **Vendido**.",
            ],
          },
          {
            list: [
              "**Reservado:** continua no site com o aviso de reserva e os anúncios nos portais ficam **pausados**.",
              "**Vendido:** sai do site e de todos os portais.",
              "**Disponível:** volta a ser anunciado.",
            ],
          },
        ],
      },
      {
        slug: "editar-ou-excluir",
        title: "Como editar ou excluir um veículo?",
        summary: "Mudar preço e fotos, ou apagar o cadastro de vez.",
        where: "Estoque › veículo",
        body: [
          { steps: ["Em **Estoque**, clique no veículo.", "Altere o que precisar no formulário e clique em salvar.", "O site e os portais são atualizados em seguida."] },
          { h: "Excluir" },
          { p: "No quadro **Status**, clique em **Excluir veículo** e confirme. O carro sai do site e de todos os portais e **não dá para desfazer**." },
          { tip: "Se o carro foi vendido, prefira marcar **Vendido**: o histórico continua nos relatórios." },
        ],
      },
      {
        slug: "destaque-e-selos",
        title: "O que são Destaque e Selo de campanha?",
        summary: "Formas de dar mais visibilidade a um carro no site.",
        body: [
          {
            list: [
              "**Destaque:** o carro aparece primeiro nas listas do site.",
              "**Selo de campanha:** uma etiqueta no card (ex.: “Taxa 0”, “Feirão”). Carros com selo aparecem primeiro em “Carros para financiar com taxas especiais”.",
              "**Histórico veicular:** mostra o selo verde na galeria da página do carro.",
            ],
          },
        ],
      },
      {
        slug: "vendedor-consulta-estoque",
        title: "O vendedor pode ver o estoque?",
        summary: "Sim, em modo consulta, para atender o cliente.",
        body: [
          { p: "O vendedor abre qualquer veículo em **Estoque** e vê fotos, ficha, preço, FIPE e a situação nos portais. Só o gestor altera preço, fotos e status." },
        ],
      },
    ],
  },
  {
    slug: "marketplaces",
    title: "Marketplaces",
    description: "Anunciar o estoque na OLX, WebMotors e Mercado Livre em poucos cliques.",
    icon: "store",
    articles: [
      {
        slug: "conectar-portal",
        title: "Como conectar um portal?",
        summary: "Três passos e menos de um minuto.",
        where: "Marketplaces",
        body: [
          {
            steps: [
              "Abra **Marketplaces** e clique em **Conectar** no portal desejado.",
              "**Conta:** informe a conta da loja no portal (e-mail da OLX, CNPJ ou usuário do Cockpit WebMotors, ou conta do Mercado Livre).",
              "**Regras:** escolha **Todo o estoque disponível** (recomendado) ou **Escolher carro a carro**, e, se quiser, uma faixa de preço.",
              "**Pronto:** o Torque mostra quantos anúncios foram publicados.",
            ],
          },
          { tip: "Com **Todo o estoque disponível**, cada carro novo cadastrado também é anunciado sozinho." },
        ],
      },
      {
        slug: "regras-de-anuncio",
        title: "Como mudar as regras de um portal?",
        summary: "Todo o estoque ou carro a carro, e faixa de preço.",
        where: "Marketplaces › Regras",
        body: [
          { steps: ["Em **Marketplaces**, clique em **Regras** no portal.", "Altere o escopo e a faixa de preço.", "Salve. Os anúncios são ajustados na hora."] },
          { p: "No modo **carro a carro**, ligue ou desligue cada anúncio na página do veículo, em **Anúncios nos portais › Anunciar / Tirar do portal**." },
        ],
      },
      {
        slug: "anuncio-com-erro",
        title: "O que fazer quando um anúncio está com erro?",
        summary: "Veja o motivo e corrija o cadastro do veículo.",
        body: [
          {
            steps: [
              "O sino do Torque avisa quando há anúncios com erro.",
              "Abra o veículo em **Estoque**. Em **Anúncios nos portais**, o motivo aparece ao lado do portal.",
              "Corrija o cadastro (geralmente foto, versão ou preço) e salve. O anúncio é enviado de novo.",
            ],
          },
          { p: "Se o erro continuar, use **Sincronizar** em **Marketplaces** ou fale com o suporte." },
        ],
      },
      {
        slug: "desconectar-portal",
        title: "Como desconectar um portal?",
        summary: "Tira todos os anúncios daquele portal.",
        where: "Marketplaces",
        body: [{ p: "Em **Marketplaces**, clique em **Desconectar** no portal. Todos os anúncios dele saem do ar; o site e os outros portais não mudam." }],
      },
    ],
  },
  {
    slug: "site",
    title: "Site da loja",
    description: "Logo, cores, banners, pop-up, barra superior e página do veículo.",
    icon: "globe",
    articles: [
      {
        slug: "logo-cor-favicon",
        title: "Como trocar logo, cor e favicon?",
        summary: "A identidade visual do site.",
        where: "Site › Identidade",
        body: [
          {
            steps: [
              "Abra **Site › Identidade**.",
              "Em **Logo**, envie um PNG ou SVG horizontal com fundo transparente.",
              "Em **Favicon**, envie um PNG quadrado (512×512). Ele aparece na aba do navegador e no atalho do celular.",
              "Em **Cor principal**, escolha a cor dos botões, preços e destaques.",
              "Preencha **Título do site** e **Descrição** (como a loja aparece no Google) e clique em **Salvar identidade**.",
            ],
          },
        ],
      },
      {
        slug: "banners",
        title: "Como trocar os banners da página inicial?",
        summary: "Carrossel do topo e banners promocionais.",
        where: "Site › Banners",
        body: [
          {
            steps: [
              "Abra **Site › Banners**.",
              "Em **Novo banner do topo**, envie a imagem (ideal 1600×500), escreva o título, o texto e o link do botão.",
              "Clique em salvar. Use as setas para mudar a ordem e o botão para tirar do ar sem apagar.",
              "Para os dois banners do meio da página, use **Adicionar banner promocional**.",
            ],
          },
          { tip: "Sem nenhum banner cadastrado, o site usa os banners padrão do tema." },
        ],
      },
      {
        slug: "full-width-ou-boxed",
        title: "Como escolher entre tela inteira (full width) e centralizado (boxed)?",
        summary: "A largura do site no computador.",
        where: "Site › Aparência",
        body: [
          {
            steps: [
              "Abra **Site › Aparência**.",
              "Em **Largura do site**, escolha **Tela inteira (full width)** ou **Centralizado (boxed)**.",
              "Clique em **Salvar aparência**.",
            ],
          },
          { p: "No celular o site sempre ocupa a tela toda." },
        ],
      },
      {
        slug: "barra-superior",
        title: "Como colocar uma barra de aviso no topo do site?",
        summary: "Faixa fina para campanhas, horários e avisos.",
        where: "Site › Aparência › Barra superior",
        body: [
          {
            steps: [
              "Abra **Site › Aparência**.",
              "Marque **Mostrar barra superior** e escreva o texto.",
              "Se quiser, informe o texto e o endereço do link (ex.: **/estoque**).",
              "Escolha a cor de fundo e a do texto e se o visitante pode fechar a barra.",
              "Clique em **Salvar aparência**.",
            ],
          },
        ],
      },
      {
        slug: "pop-up",
        title: "Como configurar o pop-up de abertura?",
        summary: "Conteúdo, o que o botão faz, tempo para abrir e frequência.",
        where: "Site › Aparência › Pop-up",
        body: [
          {
            steps: [
              "Abra **Site › Aparência** e marque **Ativar pop-up**.",
              "Escreva o **título** e o **texto**; envie uma imagem se quiser.",
              "Em **O que o botão faz**, escolha: **Captar contato** (pede nome e WhatsApp e cria um lead), **Abrir WhatsApp**, **Abrir um link** ou **Só aviso**.",
              "Em **Abrir depois de (segundos)**, defina quanto tempo esperar (recomendado: 5 a 10).",
              "Escolha a frequência (por visita, dia, semana ou sempre) e se aparece em todas as páginas ou só na inicial.",
              "Clique em **Salvar aparência**.",
            ],
          },
          { tip: "Contatos captados pelo pop-up entram no CRM com o canal **Site** e vão para o vendedor da vez." },
        ],
      },
      {
        slug: "pagina-inicial",
        title: "Como ligar ou desligar seções da página inicial?",
        summary: "Modelos, financiamento, promoções, 0 km e mais.",
        where: "Site › Página inicial",
        body: [
          {
            steps: [
              "Abra **Site › Página inicial**.",
              "Ligue ou desligue cada seção.",
              "Edite os textos da faixa **venda seu usado** e a taxa de juros usada na simulação de parcelas.",
              "Clique em **Salvar página inicial**.",
            ],
          },
        ],
      },
      {
        slug: "botoes-de-contato",
        title: "Como escolher os botões de contato da página do veículo?",
        summary: "Formulário, WhatsApp ou ligar: você define a regra.",
        where: "Site › Página do veículo",
        body: [
          {
            steps: [
              "Abra **Site › Página do veículo**.",
              "Em **Ação principal**, escolha **Formulário de mensagem**, **WhatsApp** ou **Ligar**.",
              "Em **Segundo botão**, escolha outra ação ou **Nenhum**.",
              "Marque **Pedir nome e WhatsApp antes do WhatsApp/ligação** para identificar todo cliente no CRM.",
              "Defina se o e-mail é obrigatório e o que acontece depois do formulário (confirmação ou abrir o WhatsApp do vendedor).",
              "Se quiser, mude os textos dos botões e clique em **Salvar página do veículo**.",
            ],
          },
          { p: "No computador os botões ficam ao lado do preço; no celular, numa barra fixa no rodapé, como nos apps de classificados." },
        ],
      },
      {
        slug: "referencia-de-preco",
        title: "O que é a Referência de preço?",
        summary: "Card abaixo do preço com seu selo e a comparação com a FIPE.",
        where: "Site › Página do veículo › Referência de preço",
        body: [
          { p: "É um card logo abaixo do preço que ajuda o cliente a confiar no valor do carro." },
          {
            steps: [
              "Abra **Site › Página do veículo**.",
              "Marque **Mostrar referência de preço**.",
              "Envie uma imagem ou selo, escreva um título e um texto, e, se quiser, um link.",
              "Marque **Comparar com a tabela FIPE** para mostrar a régua (abaixo, na média, acima).",
            ],
          },
          { tip: "A comparação só aparece nos carros com o campo **Tabela FIPE** preenchido no cadastro." },
        ],
      },
      {
        slug: "contato-e-redes",
        title: "Como alterar o WhatsApp, telefone e redes sociais?",
        summary: "Contatos que aparecem no site.",
        where: "Site › Contato e WhatsApp",
        body: [
          {
            steps: [
              "Abra **Site › Contato e WhatsApp**.",
              "Informe o **número principal** do WhatsApp e a mensagem inicial.",
              "Preencha telefone fixo, e-mail e os links de Instagram, Facebook, YouTube, TikTok e LinkedIn.",
              "Clique em **Salvar contatos**.",
            ],
          },
          { p: "As redes preenchidas aparecem como ícones no rodapé e no menu do celular. O telefone fixo é usado no botão **Ligar**." },
        ],
      },
      {
        slug: "lojas-unidades",
        title: "Como cadastrar outra unidade (loja)?",
        summary: "Endereço e WhatsApp de cada unidade.",
        where: "Site › Lojas",
        body: [
          { steps: ["Abra **Site › Lojas**.", "Preencha **Nome**, **Cidade - UF**, endereço e WhatsApp da unidade.", "Salve. A unidade aparece no rodapé do site e pode receber carros e vendedores."] },
        ],
      },
    ],
  },
  {
    slug: "dominio",
    title: "Domínio",
    description: "Usar o endereço da plataforma ou conectar o domínio da sua loja.",
    icon: "link",
    articles: [
      {
        slug: "endereco-do-site",
        title: "Qual é o endereço do meu site?",
        summary: "Toda loja nasce com um endereço da plataforma.",
        body: [
          { p: "Ao contratar, sua loja ganha o endereço **sualoja.softmotors.com.br**, já com cadeado de segurança. Ele continua funcionando mesmo depois de conectar um domínio próprio." },
        ],
      },
      {
        slug: "conectar-dominio",
        title: "Como conectar o domínio da minha loja?",
        summary: "Use www.sualoja.com.br no lugar do endereço da plataforma.",
        where: "Site › Domínio",
        body: [
          {
            steps: [
              "Abra **Site › Domínio**.",
              "Digite o domínio (ex.: **sualoja.com.br**) e clique em **Conectar domínio**.",
              "No painel onde o domínio foi registrado (Registro.br, HostGator, GoDaddy…), crie os registros mostrados na tela: um **CNAME** em **www** e um **A** na raiz.",
              "Volte ao Torque e clique em **Verificar agora**.",
            ],
          },
          { p: "Quando aparecer **Domínio verificado**, o site já responde no seu domínio com cadeado de segurança." },
          { warn: "A propagação do DNS pode levar de alguns minutos a algumas horas. Não apague registros de e-mail (MX) do domínio." },
        ],
      },
      {
        slug: "desconectar-dominio",
        title: "Como desconectar o domínio?",
        summary: "O site volta para o endereço da plataforma.",
        where: "Site › Domínio",
        body: [{ p: "Em **Site › Domínio**, clique em **Desconectar**. O site continua no ar em **sualoja.softmotors.com.br**." }],
      },
    ],
  },
  {
    slug: "equipe",
    title: "Equipe",
    description: "Vendedores, gestores, acessos e o rodízio de leads.",
    icon: "users",
    articles: [
      {
        slug: "adicionar-vendedor",
        title: "Como adicionar um vendedor?",
        summary: "Ele entra no rodízio de leads da loja dele.",
        where: "Equipe",
        body: [
          {
            steps: [
              "Abra **Equipe**.",
              "Em **Adicionar à equipe**, preencha o nome e o **WhatsApp** (é para ele que os clientes serão direcionados).",
              "Escolha o **Papel** (Vendedor ou Gestor) e a **Loja**.",
              "Para ele acessar o Torque, informe **e-mail** e uma **senha** de 8 caracteres ou mais.",
              "Clique em **Adicionar**.",
            ],
          },
        ],
      },
      {
        slug: "desativar-membro",
        title: "Como tirar alguém do rodízio ou bloquear o acesso?",
        summary: "Desativar para na hora o recebimento de leads e o acesso.",
        where: "Equipe",
        body: [
          { p: "Em **Equipe**, clique em **Desativar** na pessoa. Ela para de receber leads e perde o acesso ao Torque na hora. Use **Reativar** para voltar." },
        ],
      },
      {
        slug: "redefinir-senha",
        title: "Como redefinir a senha de um vendedor?",
        summary: "O gestor define uma nova senha.",
        where: "Equipe › Editar",
        body: [{ steps: ["Em **Equipe**, clique em **Editar** na pessoa.", "Preencha **Nova senha** e clique em **Salvar**.", "Envie a nova senha ao vendedor."] }],
      },
    ],
  },
  {
    slug: "site-no-celular",
    title: "Seu site no celular",
    description: "Como o cliente usa o site: abas, favoritos, contato e app na tela inicial.",
    icon: "smartphone",
    articles: [
      {
        slug: "experiencia-de-app",
        title: "Como o site funciona no celular?",
        summary: "Navegação de aplicativo, sem baixar nada.",
        body: [
          {
            list: [
              "**Barra de abas** fixa: Início, Buscar, Favoritos, Vender e Menu.",
              "**Busca rápida** na página inicial por tipo, marca e faixa de preço.",
              "**Galeria** que desliza com o dedo e mostra o contador de fotos.",
              "**Barra de contato** fixa na página do veículo, com os botões que você escolheu no Torque.",
              "**Favoritos:** o cliente salva carros no coração e vê a lista na aba Favoritos.",
            ],
          },
        ],
      },
      {
        slug: "instalar-como-app",
        title: "O cliente pode instalar o site como aplicativo?",
        summary: "Sim, como atalho na tela inicial do celular.",
        body: [
          {
            steps: [
              "No celular, o cliente abre o site da loja.",
              "No **Android (Chrome)**, toca no menu ⋮ e em **Instalar app** ou **Adicionar à tela inicial**.",
              "No **iPhone (Safari)**, toca em **Compartilhar** e em **Adicionar à Tela de Início**.",
            ],
          },
          { p: "O atalho usa o nome da loja e o **favicon** enviado em **Site › Identidade** e abre o site em tela cheia, como um app." },
        ],
      },
    ],
  },
  {
    slug: "conta-e-seguranca",
    title: "Conta e segurança",
    description: "Seus dados de acesso e boas práticas.",
    icon: "shield",
    articles: [
      {
        slug: "trocar-senha",
        title: "Como trocar minha senha?",
        summary: "Pela tela Conta.",
        where: "Conta",
        body: [{ steps: ["Clique em **Conta**, no rodapé do menu.", "Em **Trocar senha**, informe a senha atual e a nova duas vezes.", "Clique em **Trocar senha**."] }],
      },
      {
        slug: "boas-praticas",
        title: "Boas práticas de segurança",
        summary: "Cuidados com acessos da equipe.",
        body: [
          {
            list: [
              "Cada pessoa deve ter o **próprio login**; não compartilhe senhas.",
              "Use senhas com 8 caracteres ou mais, misturando letras e números.",
              "Quando alguém sair da loja, clique em **Desativar** em **Equipe** no mesmo dia.",
              "A SoftMotors **nunca** pede sua senha por telefone, e-mail ou WhatsApp.",
            ],
          },
        ],
      },
    ],
  },
];

export const findModule = (slug: string) => MODULES.find((m) => m.slug === slug);

export function findArticle(moduleSlug: string, articleSlug: string) {
  const mod = findModule(moduleSlug);
  const article = mod?.articles.find((a) => a.slug === articleSlug);
  return mod && article ? { mod, article } : null;
}

const plain = (b: Block) => Object.values(b).flat().join(" ");
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\*/g, "");

/** Busca simples: todas as palavras precisam aparecer no título, resumo ou texto do artigo. */
export function searchArticles(query: string) {
  const words = norm(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  return MODULES.flatMap((mod) =>
    mod.articles
      .map((article) => {
        const title = norm(article.title);
        const text = norm(`${article.title} ${article.summary} ${article.body.map(plain).join(" ")}`);
        if (!words.every((w) => text.includes(w))) return null;
        return { mod, article, score: words.filter((w) => title.includes(w)).length };
      })
      .filter((r) => r !== null),
  ).sort((a, b) => b.score - a.score);
}
