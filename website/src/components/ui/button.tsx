import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-danger text-white hover:bg-danger/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-border bg-background hover:bg-background-subtle hover:border-border-strong hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "hover:bg-background-subtle hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-5 py-2 text-sm sm:text-sm rounded-lg",
        sm: "h-9 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-lg",
        lg: "h-12 sm:h-13 px-6 sm:px-8 text-base sm:text-lg rounded-lg",
        icon: "h-10 w-10 sm:h-11 sm:w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
