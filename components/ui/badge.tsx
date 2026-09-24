import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// DESIGN_SYSTEM.md §20. Badge é rótulo, não botão: sem hover, raio de
// controle, fundo sutil. Estado de negócio usa <StatusBadge>, que junta
// ícone + texto + cor.
const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-control border px-1.5 py-0.5 text-xs font-medium leading-4 [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-accent-foreground',
        secondary: 'border-transparent bg-neutral-state-subtle text-neutral-state',
        destructive: 'border-transparent bg-danger-subtle text-danger',
        success: 'border-transparent bg-success-subtle text-success',
        warning: 'border-transparent bg-warning-subtle text-warning',
        outline: 'border-border-strong text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
