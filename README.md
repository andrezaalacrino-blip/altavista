# Alta Vista Coffee — site institucional

Next.js 16 (App Router) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção (igual ao da Vercel)
```

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Exemplo | Uso |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://altavistacoffee.com.br` | canonical, sitemap, Open Graph |
| `NEXT_PUBLIC_WHATSAPP` | `5535999999999` | botões e formulário (só dígitos, com DDI) |

## Estrutura

- `src/components/sections/*` — seções da home (Hero, About, Pillars, Process, Markets, Contact)
- `src/content/home.ts` — **textos** (proposta de copy, validar com a empresa)
- `src/lib/site.ts` — dados da empresa (itens `A CONFIRMAR`)
- `src/app/api/market/` — rota segura de cotações (servidor, cache de 60 s)
- `src/lib/market-status.ts` — regra de "ao vivo / atraso / fechamento"
- `scripts/prepare-assets.mjs` — recorta logo e separa os grãos a partir de `assets-src/`

## Cotações

- **USD/BRL**: AwesomeAPI (bid do dólar comercial)
- **Café Arábica**: ICE NY, contrato KC (1º vencimento), via Yahoo Finance — fonte não oficial, atraso de até 15 min
- **R$/saca**: conversão calculada (ICE × câmbio × 132,28 lb/saca), sem diferencial do físico

Falhas de fonte nunca geram número estimado: o card mostra "Indisponível".
O indicador CEPEA/ESALQ foi avaliado, mas o site bloqueia acesso automatizado (HTTP 403).

## Pendências antes de publicar

- [ ] Logo em SVG (o atual é raster recortado; fica suave em telas grandes)
- [ ] Saco em resolução maior (atual: 699×997) e a segunda variação do saco
- [ ] **WhatsApp: confirmar a quantidade de dígitos** de (33) 9960-3393 — tem 8 dígitos após o DDD; celulares costumam ter 9. Hoje o link `wa.me/553399603393` abre um perfil chamado "Alta Vista Coffe". Não alterar sem confirmação (`src/lib/site.ts`).
- [x] Texto institucional oficial aplicado (`src/content/home.ts`, a partir do HTML informativo)
- [ ] Confirmar endereço e trocar `site.address.confirmed` para `true` (libera o endereço nos dados estruturados)
- [ ] Coordenadas confirmadas em `site.address.coordinates` → ativa o mapa interativo Leaflet (até lá: busca do endereço no Google Maps, sinalizada como aproximada)
- [x] Direção "Dossiê de origem" aplicada à home inteira (Lighthouse produção: desktop 98, celular emulado 69–74; acessibilidade, boas práticas e SEO 100)
- [x] Redesign "Do saco ao armazém": cenas do Google Flow guiadas pelo scroll (sequências WebP em `public/seq`, geradas por `node scripts/build-sequences.mjs`), base preta e paleta do logotipo. Design system em `opendesign/design-systems/alta-vista/`. Lighthouse produção: desktop 99, celular 78; acessibilidade/boas práticas/SEO 100.
- [ ] **Fonte Glancyr** (manual da marca): enviar .woff2 + licença web para `assets-src/fonts`; hoje usa Urbanist como substituta
- [x] Direção clara (v2): branco-gelo/bege, fotos de lavoura e armazém, grãos PNG reais, formulário comercial → WhatsApp. Vídeos e cenas fixas removidos (as sequências podem ser regeradas com `node scripts/build-sequences.mjs`).
- [ ] Fotos de lavoura e armazém em alta resolução (as atuais têm ~650 px de largura; por isso ficam em molduras, não em tela cheia)
- [ ] E-mail e CNPJ (`src/lib/site.ts`)
- [ ] Validar as 5 etapas da negociação (`src/content/home.ts`)
- [ ] Imagem de Open Graph
