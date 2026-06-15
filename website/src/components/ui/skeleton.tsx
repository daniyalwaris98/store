import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gradient-to-br from-muted to-muted/70", className)}
      {...props}
    />
  )
}

export { Skeleton }
