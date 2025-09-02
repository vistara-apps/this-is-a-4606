/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 70%, 50%)",
        accent: "hsl(140, 70%, 50%)",
        bg: "hsl(220, 15%, 95%)",
        surface: "hsl(0, 0%, 100%)",
        textPrimary: "hsl(220, 15%, 15%)",
        textSecondary: "hsl(220, 15%, 45%)",
        dark: {
          bg: "hsl(240, 20%, 8%)",
          surface: "hsl(240, 15%, 12%)",
          card: "hsl(240, 12%, 16%)",
          border: "hsl(240, 10%, 20%)"
        },
        purple: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9"
        },
        pink: {
          500: "#EC4899",
          600: "#DB2777"
        }
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "1rem"
      },
      spacing: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1.25rem"
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)",
        modal: "0 16px 32px rgba(0,0,0,0.12)"
      }
    },
  },
  plugins: [],
}