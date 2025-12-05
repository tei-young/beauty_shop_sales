/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 핑크 계열 (메인 브랜드)
        primary: '#FFA0B9',       // 메인 핑크
        primaryDark: '#F28AA5',   // 어두운 핑크 - 버튼 호버
        primaryLight: '#FFCFDD',  // 연한 핑크 - 배지, 칩

        // 배경
        background: '#FFF5F8',    // 연한 핑크 배경
        card: '#FFFFFF',          // 화이트 카드

        // 브라운/베이지 계열 (포인트)
        accent: '#F5E6D3',        // 밀크 베이지 - 매출 카드
        accentLight: '#FEFAF7',   // 아이보리 - 서브 영역
        accentHover: '#E0CDB8',   // 피치 베이지 - 호버

        // 텍스트
        textPrimary: '#2C2420',   // 거의 블랙 (브라운 틴트)
        textSecondary: '#8B7355', // 모카 브라운
        textTertiary: '#A0826D',  // 연한 모카

        // 기타
        divider: '#FFE0EB',       // 핑크 구분선
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
