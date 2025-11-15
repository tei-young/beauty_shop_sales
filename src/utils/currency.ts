/**
 * 금액을 한국식 축약 형식으로 변환
 * 50000원 → "5만원"
 * 3500원  → "3,500원"
 * 125000원 → "12만원" (12.5만원 아님!)
 */
export function formatCurrency(value: number): string {
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    return `${man}만원`;
  }
  return `${value.toLocaleString()}원`;
}

/**
 * 금액을 전체 형식으로 변환
 * 50000 → "₩50,000"
 */
export function formatFullCurrency(value: number): string {
  return `₩${value.toLocaleString()}`;
}
