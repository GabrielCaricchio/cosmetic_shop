/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Oficial: Aura Cosméticos
        brand: {
          50: '#FBF5F7',   // Superfície rosada quase branca
          100: '#F2E4E9',  // Fundo suave de chips e badges
          200: '#E7CBD4',
          300: '#D8AEC0',
          400: '#C78DA8',
          500: '#B8798E',  // Destaques decorativos
          600: '#965B72',  // Elementos secundários
          700: '#7A405B',  // Botão primário, links e CTAs
          800: '#63354B',  // Identidade principal
          900: '#4D293B',  // Hover de controles principais
          950: '#3D202F',  // Texto de alto destaque institucional
        },
        neutral: {
          50: '#FCFAFB',   // Fundo geral da loja
          100: '#F5F1F3',  // Superfícies secundárias
          200: '#EAE5E8',  // Bordas suaves
          300: '#DAD4D9',  // Bordas e divisores
          400: '#B4ABB2',
          500: '#817A83',  // Texto auxiliar e ícones
          600: '#6C656F',
          700: '#5F5962',  // Texto secundário
          800: '#403B43',  // Texto forte
          900: '#322E36',
          950: '#252229',  // Texto principal
        },
        accent: {
          50: '#FAF6ED',
          100: '#F3EBDD',  // Fundo champagne suave
          200: '#E6D7BD',
          300: '#D8C39E',
          400: '#CDB182',
          500: '#C29B65',  // Detalhe premium
          600: '#A8824E',
          700: '#8B693D',  // Acento champagne
          800: '#6E522F',
          900: '#523D23',
        },
        semantic: {
          success: '#176B4A',
          'success-bg': '#E7F4ED',
          warning: '#8B5A16',
          'warning-bg': '#FFF3D9',
          danger: '#B12E42',
          'danger-bg': '#FCEAED',
          info: '#315F89',
          'info-bg': '#EAF2FA',
        },
        'admin-canvas': '#F6F7F9',

        // Cores complementares para compatibilidade
        botanic: {
          50: '#F4F9F6',
          100: '#E4F1EC',
          500: '#3D8E73',
          700: '#1F5A47',
          950: '#091F18',
        },
        champagne: {
          100: '#FAF6ED',
          200: '#F3EBD4',
          500: '#C5A059',
          700: '#86642E',
        },
        warm: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#EFE8DC',
          500: '#A4957F',
          900: '#231E18',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(37,34,41,0.06)',
        'md': '0 8px 24px rgba(37,34,41,0.10)',
        'lg': '0 16px 40px rgba(37,34,41,0.14)',
        'soft': '0 2px 15px -3px rgba(61, 32, 47, 0.07), 0 4px 6px -2px rgba(61, 32, 47, 0.03)',
        'luxury': '0 10px 30px -5px rgba(61, 32, 47, 0.12), 0 8px 10px -6px rgba(61, 32, 47, 0.05)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'pill': '999px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'scale-up': 'scaleUp 0.2s ease-in-out',
        'slide-left': 'slideLeft 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
