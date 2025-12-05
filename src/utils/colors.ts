// 15가지 시술 색상 팔레트 (핑크 테마 기반)
export const TREATMENT_COLORS = [
  { name: '메인 핑크', value: '#FFA0B9', emoji: '💗' },
  { name: '어두운 핑크', value: '#F28AA5', emoji: '💕' },
  { name: '로즈 핑크', value: '#FF6B9D', emoji: '🌹' },
  { name: '코랄 핑크', value: '#FF8FAB', emoji: '🪸' },
  { name: '라벤더', value: '#E0BBE4', emoji: '💜' },
  { name: '피치', value: '#FFB6C1', emoji: '🍑' },
  { name: '레드', value: '#FF3B30', emoji: '🔴' },
  { name: '오렌지', value: '#FF9500', emoji: '🟠' },
  { name: '옐로우', value: '#FFCC00', emoji: '🟡' },
  { name: '민트', value: '#30D158', emoji: '💚' },
  { name: '스카이블루', value: '#5AC8FA', emoji: '🩵' },
  { name: '퍼플', value: '#AF52DE', emoji: '🟣' },
  { name: '브라운', value: '#A2845E', emoji: '🟤' },
  { name: '그레이', value: '#8E8E93', emoji: '⚫' },
  { name: '라이트그레이', value: '#C7C7CC', emoji: '⚪' },
] as const;

export type TreatmentColor = typeof TREATMENT_COLORS[number]['value'];
