import type { Config } from 'tailwindcss'

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: '0.25rem', // 4px
        md: '0.1875rem', // 3px
        sm: '0.125rem', // 2px - default small radius
        DEFAULT: '0.125rem', // 2px - default for all rounded classes
      },
      fontSize: {
        xs: ['0.625rem', { lineHeight: '0.75rem' }], // 10px
        sm: ['0.75rem', { lineHeight: '1rem' }], // 12px
        base: ['0.875rem', { lineHeight: '1.25rem' }], // 14px (reduced from 16px)
        lg: ['1rem', { lineHeight: '1.5rem' }], // 16px (reduced from 18px)
        xl: ['1.125rem', { lineHeight: '1.75rem' }], // 18px (reduced from 20px)
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }], // 20px (reduced from 24px)
        '3xl': ['1.5rem', { lineHeight: '2rem' }], // 24px (reduced from 30px)
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px (reduced from 36px)
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px (reduced from 48px)
        '6xl': ['3rem', { lineHeight: '1' }], // 48px (reduced from 60px)
        '7xl': ['3.75rem', { lineHeight: '1' }], // 60px (reduced from 72px)
        '8xl': ['4.5rem', { lineHeight: '1' }], // 72px (reduced from 96px)
        '9xl': ['6rem', { lineHeight: '1' }], // 96px (reduced from 128px)
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config