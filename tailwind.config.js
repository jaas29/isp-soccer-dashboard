/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#232330',
          500: '#2d2d3d',
        },
        accent: {
          green: '#10b981',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          orange: '#f97316',
          red: '#ef4444',
          yellow: '#eab308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
