// src/lib/constants/theme.ts - Theme Configuration

export const theme = {
  // Radius for all components
  radius: "lg",

  // Primary color
  primary: "#0f0f0f",
  primaryForeground: "#ffffff",
  primaryHover: "#1a1a1a",

  // Secondary color
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172a",

  // Accent
  accent: "#2563eb",
  accentForeground: "#ffffff",
  accentLight: "#dbeafe",

  // Shadows - Elevation system
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Border radius values
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  // Typography scale
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  // Transitions
  transitions: {
    fast: "150ms ease",
    base: "200ms ease",
    slow: "300ms ease",
    spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
}
