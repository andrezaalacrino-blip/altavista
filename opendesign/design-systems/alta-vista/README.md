# Alta Vista Coffee — design system

**Empresa:** ALTA VISTA COFFEE LTDA. — intermediação de negócios no mercado de café, com foco em café escolha e conferência no armazém do produtor. Não é cafeteria nem loja.

## Fontes consultadas
- Código do site: `src/app/globals.css`, `src/components/**`, `src/content/home.ts`, `src/lib/site.ts`.
- Logotipo oficial: `src/assets/brand/symbol.png`, `wordmark.png`, `wordmark-creme.png` (cores medidas por pixel).
- Manual de identidade publicado no Behance (Front Estúdio Criativo, 2024): base preta, paleta amarelo/verde/marrom, tipografia Glancyr, versões do logo (colorido sobre preto, contorno dourado, marrom sobre branco), aplicações em uniforme, boné, big bag e empilhadeira, fotografia de cafezal em P&B.
- Material institucional (HTML enviado pela empresa): textos de Quem somos, diferenciais, processo, endereço e WhatsApp.
- Vídeos de cena (Google Flow): `assets-src/video/` — saco tombando, grãos à câmera, grãos se afastando, armazém.

## Índice
- `tokens/colors_and_type.css` — tokens canônicos (cores, tipo, espaço, movimento).
- `assets/logos/` — logotipo oficial.
- `SKILL.md` — regras resumidas para agentes.

## Cor (papéis)
| Token | Hex | Papel |
|---|---|---|
| `--av-preto` | #0E0B09 | Base de todas as superfícies escuras |
| `--av-branco` | #F6F3EE | Texto sobre preto |
| `--av-amarelo` | #FCB400 | Ação (botões), destaques pontuais, foco |
| `--av-marrom` | #84300C | Detalhes, números de etapa sobre claro |
| `--av-verde` | #006C18 | Confirmações e indicadores sobre claro |
| `--av-creme-cena` | #E0DBD1 | Fundo claro que casa com o fim das cenas de grãos |

Contraste: branco e amarelo sobre preto passam AA. Verde e marrom sobre preto **não** passam para texto — use só sobre fundos claros ou como superfície.

## Tipografia
Glancyr em tudo (fallback Urbanist até os arquivos chegarem). Sentence case. Sem caixa-alta espaçada em rótulos. Mínimo 16px para texto corrido no celular, 13px absoluto para dados.

## Movimento
Um vídeo guiado pelo scroll conta a narrativa (saco → grãos → Quem somos → armazém). Fora dele, movimento só responde à ação do usuário. `prefers-reduced-motion` troca as cenas por quadros fixos.

## Voz
Direta, segura, próxima do produtor: "Venda seu café", "Negocie sua matéria-prima", "A conferência vai até seu armazém". Sem jargão financeiro, sem superlativos.

## A confirmar
- Arquivos da fonte Glancyr e licença de uso na web.
- Hex oficiais do manual (os atuais foram medidos no logotipo).
