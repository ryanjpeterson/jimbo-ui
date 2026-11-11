// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
// shadcn/ui primitive, with jimbo.ui's edits (guide §14).
"use client"

import * as React from "react"
import { cn } from "@/lib/cn"
import { Progress as ProgressPrimitive } from "radix-ui"

// jimbo.ui: a brand `tone` for the fill, a `size` (lg for the one job a tile
// is about), and no value = working, length unknown: a third of the track
// sweeping across (M3).
const FILL = { primary: "bg-primary", highlight: "bg-highlight", support: "bg-support" } as const

function Progress({
  className,
  value,
  tone = "primary",
  size = "md",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { tone?: keyof typeof FILL; size?: "md" | "lg" }) {
  const known = value != null
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted",
        size === "lg" ? "h-3" : "h-2",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full",
          FILL[tone],
          known ? "w-full flex-1 transition-transform duration-300" : "absolute inset-y-0 w-1/3 motion-safe:animate-[jimbo-sweep_1.4s_ease-in-out_infinite]"
        )}
        style={known ? { transform: `translateX(-${100 - (value || 0)}%)` } : undefined}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
