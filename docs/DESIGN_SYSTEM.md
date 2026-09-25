# FLUXTEME Design System

Regras de produto derivadas do **Manual de Marca FLUXTEME v2.0** (agosto de 2026). O manual é
documento interno e confidencial até o registro no INPI, por isso não está versionado neste
repositório. Em qualquer conflito, o manual prevalece sobre este documento, e este documento
prevalece sobre qualquer decisão visual avulsa no código.

- Tokens: `app/globals.css` e `tailwind.config.js`
- Componentes: `components/ui/*`
- Navegação: `lib/navegacao.ts`
- Diagnóstico de partida: `docs/AUDITORIA_UI.md`

---

## 1. Princípios

1. **Verificável antes de bonito.** Toda informação que pode ser conferida mostra o valor exato: horário até o segundo, identificador completo sob demanda, autor da ação.
2. **Hierarquia por tipografia, peso e espaço.** Cor vem por último e só comunica estado.
3. **Neutro por padrão, destaque por exceção.** Teal/Aqua marca a ação principal, o item ativo e o dado. Nunca decora.
4. **Densidade de ferramenta de trabalho.** Tabelas mostram muitas linhas; nada vira card sem motivo.
5. **Uma linguagem.** Um botão, uma tabela, um badge, um estado vazio. Antes de criar componente, usar o que existe em `components/ui`.

## 2. Fundamentos da marca aplicados ao produto

O Manual define o nome como FLUX + (EPIS)TEME: **conhecimento justificado**, oposto de *doxa* (opinião).
Na interface isso vira:

| Doxa (evitar) | Episteme (fazer) |
|---|---|
| "Aprovado" sem autor | "Aprovado pelo gerente · Maria Souza · 24/09/2026 14:32:07" |
| Data só com o dia | Carimbo até o segundo, fuso de Brasília, UTC no *tooltip* |
| Número solto | Número com comparação (mês anterior, total, meta) |
| "Histórico" editável | "Trilha de auditoria" append-only |
| "Rápido", "fácil", "automático" | "Verificável", "rastreável", "registrado" |

Consequência prática do Manual (seção 01): nenhum texto do produto promete velocidade ou automação
como benefício principal.

## 3. Cores

Valores oficiais medidos (Manual, seção 05):

| Nome | Hex | Papel | Token |
|---|---|---|---|
| Fluxteme Navy | `#011832` | Base estrutural, sidebar, fundo escuro, texto de título | `brand-navy`, `foreground` (claro), `background` (escuro) |
| Fluxteme Teal | `#00668A` | Destaque em fundo claro: ação, link, item ativo | `primary` (claro) |
| Fluxteme Aqua | `#00AEDE` | Destaque em fundo escuro, barra do símbolo | `primary` (escuro), `sidebar-active` |
| Cinza técnico | `#DFE3E6` | Fios, tabelas, superfícies | `border` (claro) |

**Proporção 60 / 30 / 10.** Navy estrutura (sidebar navy nos dois temas), branco/cinza é superfície de
leitura, Teal/Aqua fica em ~10%: botão primário, item ativo, contador, uma ênfase por área.

**Restrição de contraste.** Aqua sobre branco dá 2,6:1 — **nunca** é texto em fundo claro. No tema claro o
destaque é Teal (6,4:1). Todo par texto/fundo dos tokens foi medido com mínimo de 4,5:1.

**Estado** (sempre com ícone e texto, nunca só cor):

| Estado | Claro | Escuro | Uso |
|---|---|---|---|
| `success` | `#0F7A4A` | `#3FC38A` | Concluído, aprovado, pago |
| `warning` | `#9A4B06` | `#F2A64B` | Pendente de ação, prazo, correção |
| `danger` | `#B42318` | `#F47A71` | Recusa, erro, bloqueio, vencido |
| `neutral-state` | texto secundário | texto secundário | Inativo, rascunho, cancelado |

Cada estado tem `-subtle` (fundo) e `-foreground` (texto sobre o sólido).

**Proibido:** cor por categoria sem significado (ex.: roxo para plantão), gradiente decorativo, cores fora dos tokens.

## 4. Tipografia

| Família | Função | Onde |
|---|---|---|
| **Jost** | Identidade | Títulos, números de destaque, intertítulos |
| **Inter** | Leitura | Corpo, interface, tabelas, formulários, menus |
| **JetBrains Mono** | Evidência | IDs, hashes, protocolos, carimbos de tempo, eyebrows, cabeçalhos de tabela |

Hierarquia (Manual, seção 06, convertida para tela):

| Classe | Família e peso | Tamanho | Tracking | Uso |
|---|---|---|---|---|
| `.type-title` | Jost 300 | 30/36 | −0,5% | Título de página |
| `.type-subtitle` | Jost 400 | 20/28 | 0 | Título de modal, drawer, tela de entrada |
| `.type-intertitle` | Jost 500 | 15/22 | +1% | Título de seção e de card |
| `.type-metric` | Jost 300, tabular | 36/40 | −1% | A métrica primária da tela |
| corpo | Inter 400 | 14/20 | 0 | Texto corrido |
| rótulo | Inter 500 | 13 | 0 | `<Label>` |
| `.type-eyebrow` | JetBrains Mono 500, caixa alta | 11/16 | +16% | Rótulo técnico acima de título e métrica |
| `.type-audit` | JetBrains Mono 400, tabular | 12/16 | 0 | Valor auditável |

Regras: Inter vai até 600 (nunca `font-bold`); Jost não desce para texto miúdo; JetBrains Mono não
compõe parágrafos. Substituição autorizada fora da web (e-mail): Arial/Helvetica e Consolas/Courier New.

## 5. Espaçamento

Escala de 4 pt do Tailwind. Nenhum valor arbitrário entre degraus.

| Contexto | Valor |
|---|---|
| Dentro de controle | 8–12 (`px-3`, `gap-2`) |
| Entre campos | 12–16 (`gap-3`, `space-y-4`) |
| Dentro de card/seção | 20 (`p-5`) |
| Entre seções | 24–32 (`space-y-6`, `space-y-8`) |
| Página | `px-4 py-8 lg:px-8` |

## 6. Grid

- Contêiner de página: `mx-auto w-full max-w-7xl` para dados; `max-w-2xl`/`max-w-4xl` para formulário e leitura.
- Colunas por `grid` do Tailwind; faixas de indicadores usam `gap-px` sobre `bg-border` (régua de 1 px).
- **Grade institucional** (`.bg-grid`, linha de 1 px a 3,5–4,5% de opacidade, célula de 48 px): só em
  áreas de entrada (login, senha). Nunca sob tabela ou formulário.

## 7. Bordas

| Token | Uso |
|---|---|
| `border-subtle` | Divisão entre linhas de tabela, entre campos de evidência |
| `border` (padrão) | Contorno de card, tabela, input em repouso, régua de seção |
| `border-strong` | Botão secondary, controles, separação forte |

Borda organiza; não se contorna tudo. Seções se separam por régua inferior (`<Section>`), não por caixa.

## 8. Radius

| Token | Valor | Onde |
|---|---|---|
| `rounded-control` | 4 px | Botão, input, select, badge, item de menu |
| `rounded-lg` | 6 px | Card, tabela, modal, drawer, popover, aviso |
| `rounded-full` | — | Somente avatar, contador, marcador de trilha |

Nada de `rounded-xl` ou maior. Nenhuma seção vira "pill".

## 9. Shadows

Sombra só no que flutua sobre o conteúdo: `shadow-float` em popover, dropdown, select, modal, drawer
e toast. Cards, tabelas e botões **não** têm sombra — hierarquia vem de superfície e borda.

## 10. Ícones

Dois conjuntos, cada um com seu papel:

| Conjunto | Onde | Arquivo |
|---|---|---|
| **Ícones Fluxteme** (próprios) | Navegação, cabeçalho, tema, notificações, sair/recolher | `components/icons/fx-icons.tsx` |
| **lucide-react** | Utilitários universais: mais, baixar, fechar, setas, busca, status | pacote |

Ícones Fluxteme — derivados da geometria do símbolo F:

- Grade de 24, traço 1,5, **pontas retas e cantos vivos** (sem arredondar tudo, como as bibliotecas genéricas).
- **Um único canto arredondado no alto à esquerda**, o mesmo da haste do F — aparece em painel, documentos, aprovação, cédula, cadastro.
- Metáforas do produto: trilha de auditoria (eventos em sequência), organograma (hierarquia por cargo), documento com percentual (fiscal), documento com assinatura (contratos).
- 18 px na sidebar, 16 px no resto. Cor herdada do texto; aqua só no item ativo.
- Referência visual em `/design-system/icones` (só em desenvolvimento).

Regras gerais: ícone acompanha texto; ícone sozinho exige `aria-label` e `title`; lucide com traço 1,75.
Proibido: emoji como ícone, ícone decorativo colorido, misturar outra biblioteca.

## 11. Logo

Arquivos (originais recebidos; nada é recriado):

| Arquivo | Versão | Quando |
|---|---|---|
| `public/logo.png` | Assinatura, haste branca, barra aqua | Fundo escuro (sidebar navy, tema escuro) |
| `public/logo-claro.png` | Assinatura, haste navy, barra teal | Fundo claro |
| `public/icone.png` / `icone-claro.png` | Símbolo F | Sidebar recolhida, áreas < 32 px de altura útil |
| `public/favicon.svg` | Símbolo simplificado | Favicon |

Componente: `<BrandLogo forma="assinatura|icone" fundo="auto|escuro|claro" />`. A versão é escolhida
pela luminância do fundo (Manual, seção 08). Proibido: distorcer, rotacionar, aplicar sombra, brilho,
filtro ou contorno, trocar a cor da barra, recriar o wordmark em outra fonte. Área de proteção de 1X
(altura da barra) — não encostar texto no logo.

## 12. Layout

```
┌ Sidebar (navy) ┬ Header: onde estou · ferramentas · usuário ─────────┐
│  Logo          │ PageHeader: eyebrow · título · descrição · ações      │
│  Grupos        │ Conteúdo: faixa de métricas → filtros → tabela        │
│  Sair/recolher │                                                       │
└────────────────┴───────────────────────────────────────────────────────┘
```

- Toda página começa com `<PageHeader eyebrow title description action />`. O eyebrow é o grupo do menu.
- Agrupamento com `<Section title action>` (intertítulo + régua), nunca card dentro de card.
- Faixa de indicadores: um bloco com `gap-px`, **uma métrica primária** (`.type-metric`, coluna mais larga) e até três de apoio.

## 13. Sidebar

`components/sidebar-navigation.tsx`, dados em `lib/navegacao.ts`.

- Navy (`bg-sidebar`) nos dois temas. Largura 224 px; recolhida 64 px (preferência salva por pessoa).
- Grupos: **Visão geral · Operação · Financeiro · Gestão · Auditoria · Sistema**; Super Admin vê **Plataforma**.
- Título de grupo em eyebrow. Item: 32 px de altura, ícone 16 px, texto 13 px.
- Ativo: fundo `sidebar-hover`, texto claro, **barra aqua de 2 px à esquerda** e ícone aqua. É o único aqua da sidebar além dos contadores.
- Ativo por prefixo mais longo (subrotas mantêm o item aceso).
- Celular: gaveta sobre o conteúdo; fecha ao navegar.

## 14. Header

`components/user-header.tsx`, 56 px, fixo no topo do conteúdo.

- Esquerda: **onde estou** — `GRUPO / Página`, derivado de `lib/navegacao.ts`.
- Direita: seletor de carteira (Super Admin), ocultar valores, tema, notificações, identificação do usuário.
- Sem elemento decorativo. Se não é ferramenta nem contexto, não entra.

## 15. Navegação

- Uma fonte de verdade: `lib/navegacao.ts` (sidebar, breadcrumb e abas do painel admin).
- O menu só mostra o que a pessoa pode abrir; cada página continua validando o acesso no servidor.
- Módulos: o Manual (seção 11) mantém a nomenclatura de módulos **pendente**. O produto descreve por
  função ("Aprovações", "Fiscal") e não usa nomes de módulo (Ledger, Lex, Flux…) até a decisão formal.

## 16. Buttons

`components/ui/button.tsx`

| Variante | Visual | Uso |
|---|---|---|
| `default` (Primary) | Teal/Aqua sólido | **Uma** ação principal por área |
| `outline` / `secondary` | Borda forte, fundo de card | Ações secundárias |
| `ghost` (Tertiary) | Sem borda | Ações de linha, voltar, limpar |
| `destructive` | Vermelho sólido | Só dentro da confirmação de ação destrutiva |
| `link` | Texto teal sublinhado no hover | Navegação inline |
| `size="icon"` | 36×36 | Com `aria-label` obrigatório |

Tamanhos: `default` 36 px, `sm` 32 px, `lg` 40 px. Estados: hover, active, `focus-visible` (anel 2 px),
`disabled` (60%), **`loading`** (spinner + `aria-busy`, desabilita). O texto diz o que acontece:
"Aprovar pagamento", nunca "Confirmar".

## 17. Inputs

`components/ui/input.tsx`, `textarea.tsx`

- 36 px, raio 4 px, fundo de card, borda `input`.
- Foco: borda teal/aqua + anel de 2 px a 25%.
- Erro: `aria-invalid="true"` → borda `danger`; mensagem abaixo, em `text-danger`, dizendo o que corrigir.
- Desabilitado: fundo `muted`, 60%. Somente leitura: fundo `surface`.
- Sempre com `<Label htmlFor>`. Placeholder é exemplo, não rótulo.

## 18. Selects

`components/ui/select.tsx` — mesmo corpo do input (36 px, raio 4 px), menu com `shadow-float`,
rótulo de grupo em eyebrow. Opções em caixa de frase e com o mesmo vocabulário dos status.

## 19. Tables

`components/ui/table.tsx`

- Contêiner: `rounded-lg border border-border bg-card overflow-hidden`.
- Cabeçalho: fundo `surface`, 36 px, **JetBrains Mono 11 px caixa alta +12%** (mesmo desenho das tabelas do Manual).
- Linha: `px-3 py-2.5`, divisão `border-subtle`, hover `surface`.
- Números: alinhados à direita, `tabular-nums`, precisão total. Texto à esquerda.
- Ordenação: cabeçalho vira `<button>` com `aria-sort`.
- Linha clicável: `tabIndex={0}`, Enter/Espaço, e abre **drawer** (§25).
- Estados: `<TableSkeleton>`, `<EmptyState compact>` dentro da tabela, `<ErrorState compact>`.
- Rodapé de total em `TableFooter`. Paginação com `<SimplePager>`.
- Tabela não vira lista de cards.

## 20. Badges

`components/ui/badge.tsx` — rótulo, não botão. Raio 4 px, 12 px, fundo sutil.
Variantes: `default` (destaque), `secondary` (neutro), `success`, `warning`, `destructive`, `outline`.

## 21. Status

`components/ui/status-badge.tsx` — **ícone + texto + cor**.

- `<StatusBadge status={pedido.status} />` — ciclo do pedido (aguardando gerente, aprovado, correção solicitada, pago…).
- `<StatusIndicator status="ativo|inativo|pendente|processando|concluido|cancelado|bloqueado|erro|atencao|rascunho" />`.

Tons: andamento (teal), sucesso, atenção, erro, neutro. Rótulos em caixa de frase.

## 22. Toasts

Sistema único: **Sonner** (`components/ui/sonner.tsx`). `import { toast } from "sonner"`.

| Tipo | Exemplo |
|---|---|
| `toast.success` | "Pagamento aprovado" (mesmo verbo do botão) |
| `toast.error` | "Não foi possível registrar a decisão. Verifique a conexão e tente de novo." |
| `toast.warning` | "Atenção: o prazo desta nota vence amanhã." |
| `toast.info` | "Informação: a fatura de outubro foi emitida." |

Curto, sem exclamação, sem "com sucesso!". Detalhe vai em `description`. `hooks/use-toast.ts` existe só
por compatibilidade e repassa para o Sonner.

## 23. Alerts

`components/ui/alert.tsx` — aviso fixo na página, com **borda lateral de 2 px na cor do estado** (padrão dos
blocos de destaque do Manual). Variantes: `default` (teal), `warning`, `destructive`, `success`.
Título diz o fato; descrição diz o que fazer.

## 24. Modals

`components/ui/dialog.tsx`, `alert-dialog.tsx` — raio 6 px, `shadow-float`, overlay navy a 70%,
título em `.type-subtitle`, alinhado à esquerda.
Usar para: decisão, confirmação, criação e edição curtas. **Não** usar para consultar detalhes (é drawer).

## 25. Drawers

`components/ui/sheet.tsx`, lado direito, até 576 px (`sm:max-w-xl`).
Padrão: **tabela → registro → drawer** com dados, evidências, trilha e ações.
Referência: `components/pedido-drawer.tsx` (identificador, dados, composição, evidência fiscal, trilha de auditoria).

## 26. Tooltips

`components/ui/tooltip.tsx` — 12 px, raio 4 px, `shadow-float`. Complementa; nunca é o único lugar de
uma informação essencial. Em carimbos de tempo, o `title` traz o instante UTC.

## 27. Empty States

`components/ui/empty-state.tsx` — ícone opcional, **o que deveria estar aqui**, **por que está vazio**,
**a próxima ação** à mão. Versão `compact` dentro de tabela.
Exemplo: "Nenhum pedido aguardando sua decisão" / "Quando um pedido da sua alçada for lançado, ele aparece aqui…".

## 28. Loading States

`components/ui/loading-states.tsx` — `PageSkeleton`, `PageHeaderSkeleton`, `TableSkeleton`, `MetricsSkeleton`.

- Rota: `app/loading.tsx` mostra cabeçalho + tabela em esqueleto.
- Área: esqueleto só da área que carrega.
- Ação: `<Button loading>`.
- Spinner só dentro de botão ou item em processamento.

## 29. Error States

`components/ui/error-state.tsx` e `app/error.tsx`.

- Diz o que não foi possível fazer, o que fazer a seguir e oferece "Carregar de novo".
- Mostra o **código de referência** (digest) em mono para o suporte localizar no log.
- Nunca stack trace, nunca "Ops!", nunca pedido de desculpas.

## 30. Confirmation Dialogs

`components/ui/confirm-dialog.tsx` — obrigatório para excluir, remover, cancelar, bloquear, desativar, recusar.

- Título é a pergunta com o objeto: "Excluir rascunho 1.1?"
- `consequence` (obrigatório) explica o que muda e se dá para desfazer.
- Botão de confirmação repete o verbo ("Excluir rascunho") e fica `destructive` quando a ação é destrutiva.
- Não fecha enquanto a ação está em curso.

## 31. Dashboards

O dashboard responde, nesta ordem:

1. **O que exige ação?** Aviso com borda lateral de atenção, contagem e atalhos.
2. **O que mudou?** Uma métrica primária com comparação (mês anterior, valor de referência).
3. **Onde cada coisa está?** Pedidos por etapa.
4. **Onde se concentra?** Cortes por prestador, equipe, centro de custo.
5. **O detalhe:** tabela filtrável com exportação.

Gráficos: um tom de destaque e neutros, grade só horizontal, eixo sem borda, rótulo de eixo em mono,
tooltip com valor exato. Variação de gasto é neutra (alta de pagamentos não é "boa" nem "ruim").

## 32. Formulários

- Uma coluna em telas estreitas; no máximo duas colunas de campos relacionados.
- `<Label>` acima do campo, ajuda abaixo em `text-xs text-text-tertiary`.
- Validação ao enviar e ao sair do campo; mensagem específica ("Informe a data prevista de pagamento.").
- Uma ação primária no fim; cancelar como `outline`/`ghost`.
- Campos de dinheiro com máscara e `tabular-nums`.

## 33. Filtros

- Barra de ferramentas acima da tabela, separada por régua — não dentro de card.
- Período como grupo segmentado com estado ativo visível (`aria-pressed`).
- Filtros avançados sob "Filtros", com contador "N de M".
- "Limpar filtros" aparece só quando há filtro ativo.

## 34. Busca

Campo com ícone de lupa à esquerda, rótulo visível, filtra enquanto digita. Busca vazia mostra
`EmptyState compact` com "Limpar filtros".

## 35. Paginação

`components/ui/simple-pager.tsx` — abaixo da tabela, mostra intervalo e total, tamanho de página
selecionável. Filtrar volta para a página 1.

## 36. Auditoria

`components/ui/audit.tsx` — o tratamento que diferencia o Fluxteme.

| Componente | Mostra |
|---|---|
| `<AuditId valor curto?>` | ID, protocolo, NFS-e, chave — mono, encurtado no meio, **botão copiar** |
| `<AuditHash valor algoritmo>` | Hash de integridade (ex.: SHA-256 do termo aceito) |
| `<AuditTimestamp valor>` | `dd/mm/aaaa hh:mm:ss`, fuso de Brasília, UTC no `title` |
| `<AuditFields itens>` | Evidências: rótulo em eyebrow + valor |
| `<AuditTrail eventos>` | Trilha: ação, autor, horário, detalhe, em ordem; etapa em aberto no fim |

Regras: o que é auditável nunca aparece arredondado sem forma de ver o valor exato; toda decisão
mostra **quem** e **quando**; o vocabulário é "trilha de auditoria" para registros imutáveis e
"histórico" para o resto (Manual, seção 10).

## 37. Responsividade

Desktop é prioridade; tablet e celular funcionam.

- Sidebar vira gaveta abaixo de `lg`; cabeçalho esconde grupo e e-mail em telas estreitas.
- Tabelas: colunas secundárias com `hidden md:table-cell`; rolagem horizontal no contêiner, nunca na página.
- Drawers ocupam a largura toda no celular. Modais têm `max-h` com rolagem interna.
- Filtros empilham em uma coluna.

## 38. Acessibilidade

- Contraste mínimo 4,5:1 medido em todos os pares de token; Aqua nunca como texto em fundo claro.
- Foco visível global (`:focus-visible`, anel de 2 px) — nunca removido.
- Tudo que é clicável é alcançável por teclado (linhas de tabela, ordenação, ações de linha).
- Ícone sozinho tem `aria-label`; estado tem texto, não só cor; `aria-current` no menu; `aria-busy` em carregamento.
- Mensagens de erro ligadas ao campo (`aria-invalid`).

## 39. Motion / animações

- Só onde algo muda de estado: hover, foco, abrir/fechar, expandir. 150 ms padrão, 200 ms para drawer.
- Nenhuma entrada animada em conteúdo estático; nada pulsa sem motivo (o relógio da linha do tempo não pisca).
- `prefers-reduced-motion` zera animações e transições globalmente.

## 40. Regras anti-template

Proibido:

- card para cada informação; card dentro de card
- gradiente sem função, glow, neon, glassmorphism, blur decorativo
- sombra em superfície que não flutua; `rounded-xl` ou maior
- `font-bold` (Inter vai até 600)
- emoji como ícone; cor aleatória por categoria
- animação sem mudança de estado
- número sem comparação ou sem contexto; dashboard de números soltos
- componente duplicado — procurar em `components/ui` antes de criar
- texto em Title Case, sem acento, com exclamação, com promessa sem evidência ("revolucionário", "automatize tudo")

O profissionalismo vem de hierarquia, tipografia, espaçamento, contraste, densidade, consistência,
estados e informação verificável.
