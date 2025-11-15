// 15가지 시술 색상 팔레트 (iOS 스타일)
export const TREATMENT_COLORS = [
  { name: '레드', value: '#FF3B30', emoji: '🔴' },
  { name: '오렌지', value: '#FF9500', emoji: '🟠' },
  { name: '옐로우', value: '#FFCC00', emoji: '🟡' },
  { name: '그린', value: '#34C759', emoji: '🟢' },
  { name: '블루', value: '#007AFF', emoji: '🔵' },
  { name: '핑크', value: '#FF2D92', emoji: '🩷' },
  { name: '스카이블루', value: '#5AC8FA', emoji: '🩵' },
  { name: '민트', value: '#30D158', emoji: '💚' },
  { name: '골드', value: '#FFD60A', emoji: '💛' },
  { name: '코랄', value: '#FF6482', emoji: '🧡' },
  { name: '다크레드', value: '#D70015', emoji: '❤️' },
  { name: '퍼플', value: '#AF52DE', emoji: '🟣' },
  { name: '브라운', value: '#A2845E', emoji: '🟤' },
  { name: '그레이', value: '#8E8E93', emoji: '⚫' },
  { name: '라이트그레이', value: '#C7C7CC', emoji: '⚪' },
] as const;

export type TreatmentColor = typeof TREATMENT_COLORS[number]['value'];
