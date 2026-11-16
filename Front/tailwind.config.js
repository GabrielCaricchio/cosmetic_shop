/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Botica & Perfumaria Nobre (Inspirada em O Boticário & Natura)
        botanic: {
          50: '#F4F9F6',
          100: '#E4F1EC',
          200: '#C5E2D6',
          300: '#9BCBB8',
          400: '#68AE94',
          500: '#3D8E73',
          600: '#2A725A',
          700: '#1F5A47',
          800: '#164335',
          900: '#0F2F25',
          950: '#091F18',
        },
        champagne: {
          50: '#FCFAF5',
          100: '#FAF6ED',
          200: '#F3EBD4',
          300: '#E7D7A8',
          400: '#D9C07B',
          500: '#C5A059',
          600: '#AC8540',
          700: '#86642E',
          800: '#634920',
          900: '#483516',
        },
        warm: {
          50: '#FDFBF7',  // Fundo principal aveludado
          100: '#F8F4EC',
          200: '#EFE8DC',
          300: '#E2D7C5',
          400: '#C8BAA5',
          500: '#A4957F',
          600: '#7E705C',
          700: '#5C5142',
          800: '#3D352B',
          900: '#231E18', // Texto principal espresso de alto contraste
        },
        terracotta: {
          50: '#FDF5F3',
          100: '#FAECE8',
          200: '#F4D5CC',
          300: '#E9B3A5',
          400: '#DA8875',
          500: '#C25D4E',
          600: '#A8483B',
          700: '#89362C',
        },
        // Compatibilidade com tokens prévios
        brand: {
          50: '#F4F9F6',
          100: '#E4F1EC',
          200: '#C5E2D6',
          300: '#9BCBB8',
          400: '#68AE94',
          500: '#2A725A',
          600: '#1F5A47',
          700: '#164335',
          800: '#0F2F25',
          900: '#091F18',
        },
        gold: {
          400: '#D9C07B',
          500: '#C5A059',
          600: '#AC8540',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(15, 47, 37, 0.07), 0 4px 6px -2px rgba(15, 47, 37, 0.03)',
        'luxury': '0 10px 30px -5px rgba(15, 47, 37, 0.12), 0 8px 10px -6px rgba(15, 47, 37, 0.05)',
        'float': '0 20px 40px -10px rgba(9, 31, 24, 0.22)',
      }
    },
  },
  plugins: [],
}
