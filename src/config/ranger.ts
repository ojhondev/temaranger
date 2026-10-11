/**
 * Conteúdo editorial do tema Ranger. Textos usam `{loja}` para o nome da concessionária.
 * Próximo passo: mover para configuração por tenant no painel.
 */

export const BODY_TYPES = [
  "SUV",
  "Hatch",
  "Sedã",
  "Picape",
  "Minivan",
  "Cupê",
  "Conversível",
  "Perua/SW",
  "Van/Utilitário",
] as const;

/** Nome por extenso da carroceria na página do veículo. */
export const BODY_LABEL: Record<string, string> = {
  SUV: "Utilitário esportivo",
  "Van/Utilitário": "Van / Utilitário",
};

export type HeroBanner = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Carroceria e cor da ilustração do banner. */
  body: string;
  color: string;
  tone: "asphalt" | "dusk" | "steel" | "night";
};

export const HERO_BANNERS: HeroBanner[] = [
  {
    title: "Seu próximo SUV seminovo em até 60x",
    subtitle: "Encontre o seu na {loja}",
    cta: "Ver ofertas",
    href: "/estoque?carroceria=SUV",
    body: "SUV",
    color: "Preto",
    tone: "asphalt",
  },
  {
    title: "Picapes prontas para o trabalho pesado",
    subtitle: "Diesel, 4x4 e revisadas",
    cta: "Ver picapes",
    href: "/estoque?carroceria=Picape",
    body: "Picape",
    color: "Prata",
    tone: "steel",
  },
  {
    title: "Carros abaixo da Tabela FIPE",
    subtitle: "Oportunidades selecionadas pela {loja}",
    cta: "Ver ofertas",
    href: "/estoque?ordem=menor-preco",
    body: "Hatch",
    color: "Vermelho",
    tone: "dusk",
  },
  {
    title: "Seu usado vale mais na troca",
    subtitle: "Avaliação na hora, sem compromisso",
    cta: "Avaliar meu carro",
    href: "/estoque",
    body: "Sedã",
    color: "Branco",
    tone: "night",
  },
];

/** Taxa usada no "Ver parcelas" (simulação, sujeita a análise de crédito). */
export const FINANCING = { monthlyRate: 0.0179, terms: [24, 36, 48, 60], minDownPayment: 0.2 };

export const fill = (s: string, loja: string) => s.replaceAll("{loja}", loja);

/** Opcionais oferecidos como caixas de seleção no cadastro do veículo. */
export const COMMON_OPTIONALS = [
  "Airbag", "Alarme", "Ar quente", "Ar-condicionado", "Ar-condicionado digital", "Bancos em couro",
  "Bluetooth", "Botão de ignição/Start button", "Câmera de ré", "Central multimídia",
  "Chave inteligente/presencial", "Computador de bordo", "Controle automático de velocidade",
  "Controle de tração", "Desembaçador traseiro", "Direção elétrica", "Encosto de cabeça traseiro",
  "Faróis de LED", "Freio ABS", "GPS", "Limpador traseiro", "Retrovisores elétricos",
  "Rodas de liga leve", "Sensor de estacionamento", "Teto solar", "Travas elétricas",
  "Vidros elétricos", "Volante com regulagem de altura",
];
