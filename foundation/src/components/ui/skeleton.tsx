// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
// shadcn/ui primitive, with jimbo.ui's edits (guide §14).
import { cn } from "@/lib/cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
