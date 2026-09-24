'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
import { CheckCircle2, Info, OctagonAlert, TriangleAlert, Loader2 } from 'lucide-react'

type ToasterProps = React.ComponentProps<typeof Sonner>

// DESIGN_SYSTEM.md §22 — feedback curto, ícone na cor do estado, superfície
// neutra. Sem cores saturadas de fundo.
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = 'dark' } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      duration={5000}
      closeButton
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-success" />,
        error: <OctagonAlert className="h-4 w-4 text-danger" />,
        warning: <TriangleAlert className="h-4 w-4 text-warning" />,
        info: <Info className="h-4 w-4 text-primary" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:shadow-float group-[.toaster]:font-sans',
          title: 'group-[.toast]:text-sm group-[.toast]:font-medium',
          description: 'group-[.toast]:text-[13px] group-[.toast]:text-text-secondary',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-text-secondary',
          closeButton:
            'group-[.toast]:border-border group-[.toast]:bg-popover group-[.toast]:text-text-tertiary hover:group-[.toast]:text-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
