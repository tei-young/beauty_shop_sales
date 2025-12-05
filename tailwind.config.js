/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 핑크 계열 (액션 요소)
        primary: '#FFA0B9',       // 메인 핑크 - 버튼
        primaryDark: '#F28AA5',   // 어두운 핑크 - 버튼 호버
        primaryLight: '#FFCFDD',  // 연한 핑크 - 배지, 칩

        // 브라운 계열 (정보 표시)
        secondary: '#C9A88E',     // 태닝 브라운 - 강조 영역
        secondaryDark: '#A0826D', // 모카 브라운 - 보조
        secondaryLight: '#E8D5C4',// 연한 브라운

        // 배경
        background: '#FFF5F8',    // 연한 핑크 배경
        card: '#FFFFFF',          // 화이트 카드
        cardPink: '#FFE8F0',      // 연한 핑크 카드
        cardBeige: '#F5E6D3',     // 베이지 카드

        // 포인트 (매출 카드)
        accent: '#E0CDB8',        // 피치 베이지
        accentHover: '#D4BFA6',   // 진한 피치 베이지

        // 텍스트
        textPrimary: '#2C2420',   // 거의 블랙 (브라운 틴트)
        textSecondary: '#8B7355', // 모카 브라운
        textTertiary: '#A0826D',  // 연한 모카

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
