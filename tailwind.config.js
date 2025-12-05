/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFA0B9',       // 메인 핑크 배경
        primaryDark: '#F28AA5',   // 어두운 핑크 음영 (버튼 호버/액티브)
        background: '#FFF5F8',    // 연한 핑크 배경
        card: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#666666',
        divider: '#FFE0EB',       // 연한 핑크 구분선
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
