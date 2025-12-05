/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 핑크 계열 (포인트 컬러)
        primary: '#FFA0B9',       // 메인 핑크 - 버튼
        primaryDark: '#F28AA5',   // 어두운 핑크 - 버튼 호버
        primaryLight: '#FFCFDD',  // 연한 핑크 - 배지, 칩

        // 브라운 계열 (메인 컬러)
        accent: '#C9A88E',        // 태닝 브라운 - 매출 카드
        accentDark: '#7C5E4A',    // 다크 브라운 - 강조
        accentLight: '#F5E6D3',   // 밀크 베이지
        accentHover: '#B89A7D',   // 호버 브라운

        // 배경 (중립적인 아이보리)
        background: '#FEFAF7',    // 아이보리 배경 (핑크보다 중립)
        card: '#FFFFFF',          // 화이트 카드
        highlight: '#F5E6D3',     // 밀크 베이지 하이라이트

        // 텍스트
        textPrimary: '#2C2420',   // 브라운 블랙
        textSecondary: '#7C5E4A', // 다크 브라운
        textTertiary: '#A0826D',  // 모카 브라운
        textAccent: '#FFA0B9',    // 핑크 강조

        // 기타
        divider: '#E8D5C4',       // 베이지 구분선
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
