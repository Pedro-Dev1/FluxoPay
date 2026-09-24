# Diagnóstico de interface — antes do Design System

Levantamento feito antes da implementação do `docs/DESIGN_SYSTEM.md`, em setembro de 2026.
Serve de registro do ponto de partida e das decisões tomadas.

## Arquitetura visual encontrada

| Item | Estado |
|---|---|
| Stack | Next.js 15 (App Router), React 19, Tailwind 3.4, shadcn/ui (Radix), Recharts, Sonner |
| Tema | Tokens HSL em `app/globals.css` já existiam; tema escuro sem `ThemeProvider` montado |
| Páginas | 39 rotas `page.tsx`; 1 `loading.tsx`; nenhum `error.tsx` ou `not-found.tsx` |
| Componentes base | 59 arquivos em `components/ui`, 33 sem nenhum uso |
| Cores fixas fora de token | ~720 ocorrências em 45 arquivos (azul, cinza, verde, roxo, teal) |

## Inconsistências

- **Cabeçalho de página** em cinco estilos (`text-4xl font-bold`, `text-3xl font-bold`, `text-2xl font-semibold`…) e Title Case em vários títulos ("Meus Pagamentos", "Painel Financeiro").
- **Contêiner de página** em 15 variações de largura e espaçamento.
- **Peso 700** (`font-bold`) em 44 lugares — o Manual limita Inter a 400–600.
- **Sombras** em superfícies que não flutuam; cantos `rounded-xl` e fundos saturados como decoração.
- **Cor decorativa**: roxo, teal, índigo e sky usados para diferenciar tipos de lançamento sem significado de estado.
- **Rótulos sem acento** ("Salario Base", "Total Liquido", "Voce nao possui", "Nome da Area").
- **Mensagens** com exclamação ("Colaborador cadastrado com sucesso!") e botões genéricos ("Confirmar aprovação").
- **Dashboard**: rótulo "Valor total do período" sobre um cálculo que é do mês corrente; variação de gasto colorida como sucesso/erro.

## Componentes duplicados

| Duplicação | Resolução |
|---|---|
| Dois sistemas de toast (Sonner + toast do shadcn) | Unificado no Sonner; `hooks/use-toast.ts` virou adaptador |
| `empty.tsx` × `empty-state.tsx` | Mantido `empty-state.tsx` |
| `components/ui/sidebar.tsx` (shadcn) × `sidebar-navigation.tsx` | Mantido o do produto |
| `navigation.tsx` (menu antigo) | Removido — sem uso |
| `dashboard-filters.tsx` × filtro do `dashboard-client.tsx` | Removido o primeiro — sem uso |
| `pedidos-list.tsx` + `pedido-item.tsx` | Removidos — sem uso |
| `pedido-detail-modal.tsx` (com status inexistentes: `pendente_supervisor`, `correcao_solicitada`) | Removido; substituído por `pedido-drawer.tsx` |
| Lista de links do painel admin escrita duas vezes | `admin-nav.tsx` passa a ler de `lib/navegacao.ts` |

## Problemas de UX e bugs encontrados

- `/faturas` montava uma segunda sidebar e um segundo cabeçalho dentro do layout (props inexistentes, erro de tipo).
- Menu mostrava "Faturas" para Gerente, Supervisor e Colaborador; a página só abre para Adm e Financeiro.
- "Voltar para meses" em `/gestao/notas/[periodo]` apontava para `/notas`, rota inexistente.
- Botões de aprovar/recusar invisíveis (`opacity-0`) até o hover — inalcançáveis por teclado e toque.
- Linhas expansíveis e cabeçalhos ordenáveis só respondiam a clique.
- Item ativo da sidebar só acendia na rota exata (subrotas ficavam sem indicação).
- Trilho da linha do tempo do pedido desalinhado (cruzava as datas, não os marcadores).
- Carimbos de tempo formatados no fuso do servidor (UTC na Vercel) em telas novas.

## Ferramentas

- `pnpm lint` não roda: o ESLint não está nas dependências e não há configuração.
- `next.config.mjs` ignora erros de tipo e de lint no build; havia 34 erros de tipo antes deste trabalho.
