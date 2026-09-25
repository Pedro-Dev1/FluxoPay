import type { ReactNode, SVGProps } from "react"
import { cn } from "@/lib/utils"

// Ícones próprios do Fluxteme (DESIGN_SYSTEM.md §10) para navegação e
// cabeçalho. Derivados da geometria do símbolo F:
//   · traço 1,5 em grade de 24, pontas retas e cantos vivos;
//   · um único canto arredondado no alto à esquerda, como a haste do F;
//   · metáforas do produto (trilha, alçada, documento com evidência).
// Utilitários universais (mais, baixar, fechar, setas) continuam no lucide.

export type FxIcon = (props: { className?: string }) => ReactNode

function Base({ className, children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={cn("fx-icon h-4 w-4 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  )
}

// Documento com o canto do F — base de vários ícones
const DOC = "M6 21V6.5A3.5 3.5 0 0 1 9.5 3H18v18z"

export const IconePainel: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 20.25V7.25a3.5 3.5 0 0 1 3.5-3.5h3.5v16.5z" />
    <path d="M13.75 3.75h6.5v6.5h-6.5z" />
    <path d="M13.75 13.25h6.5v7h-6.5z" />
  </Base>
)

/** Marco: o próprio F como bandeira — novidades do produto. */
export const IconeAtualizacoes: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M6 21V7a3.5 3.5 0 0 1 3.5-3.5H19v9H6" />
    <path d="M10 8h5" />
  </Base>
)

export const IconeCriarPedido: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d={DOC} />
    <path d="M12 8.5v7M8.5 12h7" />
  </Base>
)

export const IconePedidos: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d={DOC} />
    <path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h2.5" />
  </Base>
)

/** Alçada: quadro com o canto do F e o visto. */
export const IconeAprovacoes: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 20.25V7.25a3.5 3.5 0 0 1 3.5-3.5h13v16.5z" />
    <path d="M8 12.25l2.75 2.75L16 9.75" />
  </Base>
)

/** Prazo: quadro com ponteiro — acompanhamento de nota em aberto. */
export const IconeAcompanhamento: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 20.25V7.25a3.5 3.5 0 0 1 3.5-3.5h13v16.5z" />
    <path d="M12 7.5V12l3.25 2.25" />
  </Base>
)

export const IconeNotasEquipe: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M9 21.25V10a3 3 0 0 1 3-3h8.25v14.25z" />
    <path d="M5.25 17.5V5.75a3 3 0 0 1 3-3H16.5" />
    <path d="M12.5 12h4.5M12.5 15.5h3" />
  </Base>
)

/** Cédula com o canto do F — pagamentos. */
export const IconePagamentos: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M2.75 18V9.5A3.5 3.5 0 0 1 6.25 6h15v12z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 15h1.5M16.5 9h1.5" />
  </Base>
)

export const IconeFinanceiro: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.5 20.25h17" />
    <path d="M5.5 17V13h3.5v4" />
    <path d="M10.25 17V10.5a2 2 0 0 1 2-2h1.5V17" />
    <path d="M15 17V6h3.5v11" />
  </Base>
)

export const IconeFaturas: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M6 21V6.5A3.5 3.5 0 0 1 9.5 3h5.5L18 6v15z" />
    <path d="M9.5 10.5h5M9.5 14h5M12.5 17.5h2" />
  </Base>
)

/** Documento com percentual — tributo. */
export const IconeFiscal: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d={DOC} />
    <path d="M9.5 16l5-6.5" />
    <path d="M9.25 9.25h1.5v1.5h-1.5zM13.25 14.25h1.5v1.5h-1.5z" />
  </Base>
)

/** Documento com assinatura. */
export const IconeContratos: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d={DOC} />
    <path d="M9.5 8.5h5" />
    <path d="M9 16.25c.9-1.6 1.8-1.6 2.3-.1.5 1.5 1.5 1.3 3.2-.9" />
  </Base>
)

/** Ficha cadastral. */
export const IconeCadastros: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M2.75 19V8.5A3.5 3.5 0 0 1 6.25 5h15v14z" />
    <circle cx="8.75" cy="11" r="2" />
    <path d="M5.75 16.25c.4-1.5 1.6-2.25 3-2.25s2.6.75 3 2.25" />
    <path d="M14.5 10h4M14.5 13.5h4" />
  </Base>
)

/** Organograma: a hierarquia por cargo. */
export const IconePessoas: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M9 3.75h6v4.5H9z" />
    <path d="M12 8.25v3.5M5.75 11.75h12.5M5.75 11.75v3.5M18.25 11.75v3.5" />
    <path d="M3.25 15.25h5v5h-5zM15.75 15.25h5v5h-5z" />
  </Base>
)

/** Trilha de auditoria: eventos em sequência, cada um com seu registro. */
export const IconeTrilha: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M6.5 4v16" />
    <path d="M5 6h3v3H5zM5 10.5h3v3H5zM5 15h3v3H5z" fill="currentColor" stroke="none" />
    <path d="M11 7.5h9M11 12h9M11 16.5h5.5" />
  </Base>
)

/** Documento aceito. */
export const IconeAceites: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M18 11V3H9.5A3.5 3.5 0 0 0 6 6.5V21h6" />
    <path d="M9.5 8h5M9.5 11.5h3" />
    <path d="M13.5 17.25l2.25 2.25 4.5-4.75" />
  </Base>
)

export const IconeSenha: FxIcon = ({ className }) => (
  <Base className={className}>
    <circle cx="8" cy="12" r="4" />
    <path d="M12 12h9M18 12v3.5M21 12v2.5" />
  </Base>
)

/** Controles da plataforma. */
export const IconePlataforma: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M6 3.5v17M12 3.5v17M18 3.5v17" />
    <path d="M4.25 13.5h3.5v3.5h-3.5zM10.25 6.5h3.5V10h-3.5zM16.25 11h3.5v3.5h-3.5z" fill="hsl(var(--background))" />
  </Base>
)

/** Carteira: pasta com divisória. */
export const IconeCarteiras: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M2.75 20V10.5A3.5 3.5 0 0 1 6.25 7h15v13z" />
    <path d="M9 7V4h6v3" />
    <path d="M2.75 13h18.5" />
  </Base>
)

export const IconeUsuarios: FxIcon = ({ className }) => (
  <Base className={className}>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3 20.25c.5-3.4 2.9-5.5 6-5.5s5.5 2.1 6 5.5" />
    <path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2M17.25 15c2.1.6 3.4 2.4 3.75 5.25" />
  </Base>
)

/** Termo comercial: documento com selo. */
export const IconeTermos: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d={DOC} />
    <path d="M9.5 8h5M9.5 11.5h5" />
    <circle cx="12" cy="16.25" r="1.75" />
  </Base>
)

/** Comunicado da plataforma. */
export const IconeAvisos: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 9.25v5.5h3.5l6.5 4.5V4.75l-6.5 4.5z" />
    <path d="M17 9.25a3.75 3.75 0 0 1 0 5.5M19.25 6.75a7.25 7.25 0 0 1 0 10.5" />
  </Base>
)

export const IconeSair: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M10.5 3.75H6.25a2.5 2.5 0 0 0-2.5 2.5v14h6.75" />
    <path d="M14.5 8l4 4-4 4M18.5 12h-9" />
  </Base>
)

export const IconeRecolher: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 20.25V7.25a3.5 3.5 0 0 1 3.5-3.5h13v16.5z" />
    <path d="M9.25 3.75v16.5" />
    <path d="M16 9.5L13.5 12l2.5 2.5" />
  </Base>
)

export const IconeExpandir: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 20.25V7.25a3.5 3.5 0 0 1 3.5-3.5h13v16.5z" />
    <path d="M9.25 3.75v16.5" />
    <path d="M13.5 9.5L16 12l-2.5 2.5" />
  </Base>
)

/** Suporte: balão de conversa com o canto do F. */
export const IconeSuporte: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M3.75 17.5V7.25a3.5 3.5 0 0 1 3.5-3.5h13v13.75H9.5l-4.25 3.25v-3.25z" />
    <path d="M10 9.25a2.25 2.25 0 1 1 3.4 1.95c-.75.45-1.15.95-1.15 1.8M12.25 14.5v.01" />
  </Base>
)

// Cabeçalho
export const IconeVisivel: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M2.5 12c2.2-4 5.4-6.25 9.5-6.25S19.3 8 21.5 12c-2.2 4-5.4 6.25-9.5 6.25S4.7 16 2.5 12z" />
    <path d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z" />
  </Base>
)

export const IconeOculto: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M2.5 12c2.2-4 5.4-6.25 9.5-6.25S19.3 8 21.5 12c-2.2 4-5.4 6.25-9.5 6.25S4.7 16 2.5 12z" />
    <path d="M4 20L20 4" />
  </Base>
)

export const IconeSol: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M8.25 12a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0z" />
    <path d="M12 2.5v2.25M12 19.25v2.25M2.5 12h2.25M19.25 12h2.25M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Base>
)

export const IconeLua: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M19.5 14.25A7.75 7.75 0 0 1 9.75 4.5 7.75 7.75 0 1 0 19.5 14.25z" />
  </Base>
)

export const IconeNotificacoes: FxIcon = ({ className }) => (
  <Base className={className}>
    <path d="M5.75 17.25v-5.5a6.25 6.25 0 0 1 12.5 0v5.5l1.5 1.5H4.25z" />
    <path d="M10 21h4" />
  </Base>
)
