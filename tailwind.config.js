/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        background: '#F5F5F7',
        card: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#666666',
        divider: '#E5E5EA',
        dim: 'rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        's': '12px',
        'm': '16px',
        'l': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}
