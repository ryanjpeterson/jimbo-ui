// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
// shadcn/ui primitive, with jimbo.ui's edits (guide §14).
"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  // jimbo.ui: colours come from the theme's tokens (no next-themes), top right (M4).
  return (
    <Sonner
      position="top-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4"/>,
        info: <InfoIcon className="size-4"/>,
        warning: <TriangleAlertIcon className="size-4"/>,
        error: <OctagonXIcon className="size-4"/>,
        loading: <Loader2Icon className="size-4 animate-spin"/>,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
