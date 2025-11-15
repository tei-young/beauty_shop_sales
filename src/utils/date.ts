import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Date를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Date를 YYYY-MM 형식으로 변환 (월별 데이터용)
 */
export function formatYearMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * 날짜 문자열을 표시용 형식으로 변환
 * "2025-11-07" → "11월 7일"
 */
export function formatDisplayDate(dateString: string): string {
  return format(parseISO(dateString), 'M월 d일', { locale: ko });
}

/**
 * 월 문자열을 표시용 형식으로 변환
 * "2025-11" → "2025년 11월"
 */
export function formatDisplayMonth(yearMonth: string): string {
  return format(parseISO(`${yearMonth}-01`), 'yyyy년 M월', { locale: ko });
}
