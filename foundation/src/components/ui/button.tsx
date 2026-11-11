// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
// shadcn/ui primitive, with jimbo.ui's edits (guide §14).
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { Slot } from "radix-ui"
import { Loader2Icon } from "lucide-react"

// jimbo.ui: four variants (no outline or link: S6, N4) and the control
// heights (K1) — default h-control, sm h-control-sm, and their icon squares.
// Softly rounded (rounded-lg, 10 px), 15 px semibold, a quick press (M1).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-15 font-semibold whitespace-nowrap transition-[color,background-color,border-color,transform] outline-none active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "border-border bg-secondary text-secondary-foreground hover:border-subtle-foreground",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30",
      },
      size: {
        default: "h-control px-5 has-[>svg]:px-4",
        sm: "h-control-sm gap-1.5 px-3 text-sm has-[>svg]:px-2.5",
        icon: "size-control",
        "icon-sm": "size-control-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// jimbo.ui: `loading` disables it and shows a spinner in place of its icon (M3).
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && !asChild ? <><Loader2Icon className="animate-spin" aria-hidden="true" />{children}</> : children}
    </Comp>
  )
}

export { Button, buttonVariants }
