/**
 * Dados institucionais centrais.
 * Itens marcados "A CONFIRMAR" precisam de validação da empresa antes da
 * publicação — nada aqui deve ser inventado.
 */
export const site = {
  name: "Alta Vista Coffee",
  legalName: "ALTA VISTA COFFEE LTDA.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Alta Vista Coffee: intermediação de negócios no mercado de café, com foco em café escolha e conferência diretamente no seu armazém.",
  whatsapp: {
    /**
     * Somente dígitos, com DDI — exatamente como informado: (33) 9960-3393.
     * CONFIRMAR ANTES DE PUBLICAR: o número tem 8 dígitos após o DDD;
     * celulares costumam ter 9 (nono dígito). Não alterar sem confirmação.
     */
    digits: "553399603393",
    display: "(33) 9960-3393",
  },
  instagram: "https://www.instagram.com/altavista_coffe/",
  email: "", // A CONFIRMAR
  cnpj: "", // A CONFIRMAR
  address: {
    /** A CONFIRMAR: endereço vindo do material informativo, ainda não validado */
    confirmed: false,
    lines: ["Sítio Boa Vista, s/n", "Córrego do Tabuleiro", "Santa Rita de Minas – MG", "CEP 35326-000"],
    street: "Sítio Boa Vista, s/n — Córrego do Tabuleiro",
    city: "Santa Rita de Minas",
    region: "MG",
    postalCode: "35326-000",
    /** texto usado na busca do Google Maps (sem coordenadas inventadas) */
    query: "Sítio Boa Vista, Córrego do Tabuleiro, Santa Rita de Minas - MG, 35326-000",
    /**
     * Coordenadas CONFIRMADAS pela empresa (ex.: do pin oficial no Google Maps).
     * Enquanto for null, a seção usa a busca pelo endereço no Google Maps.
     * Quando preenchido, o mapa interativo (Leaflet) passa a ser usado.
     */
    coordinates: null as null | { lat: number; lng: number },
  },
} as const;

export const nav = [
  { href: "#quem-somos", label: "Quem somos" },
  { href: "#diferencial", label: "Diferencial" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#localizacao", label: "Localização" },
  { href: "#contato", label: "Contato" },
] as const;

/** Cotas do altímetro / navegação lateral: a página é uma subida. */
export const altitudes = [
  { id: "inicio", label: "Início", meters: 800 },
  { id: "atuacao", label: "Quem somos", meters: 900 },
  { id: "diferencial", label: "Diferencial", meters: 1000 },
  { id: "negociacao", label: "Negociação", meters: 1100 },
  { id: "mercado", label: "Mercado", meters: 1200 },
  { id: "localizacao", label: "Localização", meters: 1300 },
  { id: "contato", label: "Contato", meters: 1400 },
] as const;

export const DEFAULT_WA_MESSAGE =
  "Olá! Gostaria de falar com a Alta Vista Coffee sobre uma negociação de café.";

export function whatsappLink(message: string = DEFAULT_WA_MESSAGE) {
  return `https://wa.me/${site.whatsapp.digits}?text=${encodeURIComponent(message)}`;
}

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.address.query)}`;
export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.query)}`;
export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(site.address.query)}&z=13&output=embed`;
