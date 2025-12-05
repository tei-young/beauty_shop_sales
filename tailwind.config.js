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
        primary: '#FFA0B9',       // 메인 핑크 - 버튼
        primaryDark: '#F28AA5',   // 어두운 핑크 - 버튼 호버
        primaryLight: '#FFCFDD',  // 연한 핑크 - 배지, 칩

        // 배경
        background: '#FFF5F8',    // 연한 핑크 배경
        card: '#FFFFFF',          // 화이트 카드

        // 브라운/베이지 계열 (매우 연하게, 거의 화이트)
        accent: '#FBF9F7',        // 거의 화이트에 가까운 아이보리 - 매출 카드
        accentLight: '#FFFBF9',   // 거의 순백에 가까운 아이보리
        accentHover: '#F5F2EF',   // 매우 연한 베이지 - 호버

        // 텍스트 (브라운 틴트 매우 약하게)
        textPrimary: '#1A1A1A',   // 거의 블랙
        textSecondary: '#666666', // 회색 (브라운 틴트 최소화)
        textTertiary: '#999999',  // 연한 회색

        // 기타
        divider: '#F5F2EF',       // 매우 연한 베이지 구분선
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
