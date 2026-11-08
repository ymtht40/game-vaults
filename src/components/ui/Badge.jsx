'use client';

// Variable Mapping: R -> badgeVariants, z -> Badge, e -> className, a -> variant, r -> children, n -> restProps

import { cva } from 'class-variance-authority';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-10 py-2 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-foreground/10 text-foreground',
        outline: 'border-border text-muted-foreground',
        success: 'border-brand/30 bg-brand/20 text-brand',
        info: 'border-brand-muted/30 bg-brand-muted/20 text-brand-muted',
        new: 'border-brand/30 bg-brand/20 text-brand',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// NOTE: module id: 583246
export function Badge({ className, variant, children, ...restProps }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...restProps}>
      {children}
    </span>
  );
}