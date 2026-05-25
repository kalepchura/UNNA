/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // necesario para shadcn aunque no usemos dark por defecto
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ──────────────────────────────────────────────────────────────────────
      // COLORES — todos referencian tokens CSS de src/index.css
      // ──────────────────────────────────────────────────────────────────────
      colors: {
        // Bordes e inputs
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Superficies base
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // shadcn semantic
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
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ── BRAND — acento industrial sobrio ──
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
          soft: 'hsl(var(--brand-soft))',
          'soft-foreground': 'hsl(var(--brand-soft-foreground))',
        },

        // ── STATUS — tonos semánticos consistentes ──
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          soft: 'hsl(var(--success-soft))',
          'soft-foreground': 'hsl(var(--success-soft-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warning-soft))',
          'soft-foreground': 'hsl(var(--warning-soft-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          soft: 'hsl(var(--info-soft))',
          'soft-foreground': 'hsl(var(--info-soft-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--destructive-soft))',
          'soft-foreground': 'hsl(var(--destructive-soft-foreground))',
        },

        // ── Sidebar ──
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // ── Charts ──
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },

        // ── LEGACY: semáforos (mantener para retro-compatibilidad) ──
        // Mapean a las nuevas variables status para consistencia visual.
        alerta: {
          verde: 'hsl(var(--success))',
          amarillo: 'hsl(var(--warning))',
          rojo: 'hsl(var(--destructive))',
          gris: 'hsl(var(--muted-foreground))',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },

      // ──────────────────────────────────────────────────────────────────────
      // FONTS
      // ──────────────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // ──────────────────────────────────────────────────────────────────────
      // SOMBRAS — refinadas para sensación de profundidad sutil
      // ──────────────────────────────────────────────────────────────────────
      boxShadow: {
        // Tarjetas/superficies
        'xs': '0 1px 2px 0 rgb(15 18 24 / 0.04)',
        'sm': '0 1px 2px 0 rgb(15 18 24 / 0.04), 0 1px 1px 0 rgb(15 18 24 / 0.03)',
        'DEFAULT':
          '0 1px 3px 0 rgb(15 18 24 / 0.05), 0 1px 2px -1px rgb(15 18 24 / 0.04)',
        'md':
          '0 4px 6px -1px rgb(15 18 24 / 0.05), 0 2px 4px -2px rgb(15 18 24 / 0.04)',
        'lg':
          '0 10px 15px -3px rgb(15 18 24 / 0.06), 0 4px 6px -4px rgb(15 18 24 / 0.04)',
        // Para focus rings
        'ring-brand': '0 0 0 3px hsl(var(--brand) / 0.15)',
      },

      // ──────────────────────────────────────────────────────────────────────
      // ANIMACIONES
      // ──────────────────────────────────────────────────────────────────────
      keyframes: {
        'fade-in':       { '0%': { opacity: '0' },                     '100%': { opacity: '1' } },
        'slide-up':      { '0%': { opacity: '0', transform: 'translateY(4px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down':    { '0%': { opacity: '0', transform: 'translateY(-4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-subtle':  { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
      animation: {
        'fade-in':      'fade-in 220ms ease-out',
        'slide-up':     'slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':   'slide-down 220ms ease-out',
        'pulse-subtle': 'pulse-subtle 2.4s ease-in-out infinite',
      },

      // ──────────────────────────────────────────────────────────────────────
      // SPACING — añadimos algunos valores semánticos
      // ──────────────────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },
    },
  },
  plugins: [],
}
