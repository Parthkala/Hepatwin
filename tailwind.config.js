/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1F33',
          dark: '#071524',
          light: '#162C45',
          border: '#233D5B'
        },
        canvas: '#F4F6F8',
        card: '#FFFFFF',
        accent: {
          primary: '#006D77',
          primaryHover: '#005860',
          secondary: '#E36414',
          secondaryHover: '#C9550E'
        },
        status: {
          normal: '#00873C',
          caution: '#F2A900',
          critical: '#C8102E'
        },
        clinical: {
          textPrimary: '#0B1F33',
          textSecondary: '#4A5A6A',
          textMuted: '#7A8C9E',
          borderSubtle: '#E2E6EA',
          borderStrong: '#CBD3DA'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        'xxs': '0.6875rem', // 11px
        'clinical-metric': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '700' }], // 36px
        'clinical-large': ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }], // 32px
      },
      borderRadius: {
        'sharp': '2px',
        'subtle': '3px',
      }
    }
  },
  plugins: []
};
