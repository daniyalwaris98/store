// src/lib/constants/ui.ts - Button, Card, Input Design Tokens

export const BUTTON = {
  // Shape variants
  shape: {
    default: "rounded-lg",
    pill: "rounded-full",
    square: "rounded-none",
    soft: "rounded-xl",
  },

  // Default shape (change here to affect all buttons)
  defaultShape: "default",

  // Sizes
  size: {
    default: "h-11 px-5 py-2.5",
    sm: "h-9 px-4 text-sm",
    lg: "h-13 px-8 text-lg",
    icon: "h-11 w-11",
  },

  // Typography
  fontWeight: "font-medium",
  transition: "transition-all duration-200 ease-out",

  // Shadow (subtle lift on hover)
  shadow: "shadow-sm",
  shadowHover: "shadow-md",

  // Motion
  liftHover: "-translate-y-0.5",
}

export const CARD = {
  borderRadius: "rounded-xl",
  padding: "p-5",
  shadow: "shadow-sm",
  shadowHover: "shadow-md",
  border: "border border-border",

  // Hover animation
  hover: {
    lift: "-translate-y-0.5",
    shadow: "shadow-md",
    border: "border-border-strong",
    transition: "transition-all duration-200 ease-out",
  },
}

export const INPUT = {
  borderRadius: "rounded-lg",
  padding: "px-4 py-3",
  border: "border border-border",
  focus: "ring-2 ring-accent ring-offset-2 focus:ring-offset-2",

  // Background
  bg: "bg-input-bg",

  // States
  hover: "hover:border-border-strong",
  transition: "transition-all duration-200",
}
