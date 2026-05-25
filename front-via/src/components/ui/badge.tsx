import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Originales
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive-soft text-destructive-soft-foreground [a]:hover:bg-destructive-soft/80",
        outline:
          "border-border bg-card text-foreground [a]:hover:bg-muted",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // ── STATUS (soft, recomendados para indicadores) ──
        success:
          "bg-success-soft text-success-soft-foreground border-success/15",
        warning:
          "bg-warning-soft text-warning-soft-foreground border-warning/15",
        info:
          "bg-info-soft text-info-soft-foreground border-info/15",
        brand:
          "bg-brand-soft text-brand-soft-foreground border-brand/15",

        // ── STATUS sólidos (uso escaso, para énfasis fuerte) ──
        "solid-success":
          "bg-success text-success-foreground",
        "solid-warning":
          "bg-warning text-warning-foreground",
        "solid-info":
          "bg-info text-info-foreground",
        "solid-brand":
          "bg-brand text-brand-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
