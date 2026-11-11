// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
// shadcn/ui primitive, with jimbo.ui's edits (guide §14).
import * as React from "react"
import { cn } from "@/lib/cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-control w-full min-w-0 rounded-lg border border-input bg-muted px-4 py-1 text-15 transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
