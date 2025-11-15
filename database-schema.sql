-- 뷰티샵 매출 관리 앱 데이터베이스 스키마

-- 1. 시술 테이블
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  icon TEXT,                    -- 이모지 (선택)
  color TEXT NOT NULL,          -- Hex 코드
  "order" INTEGER NOT NULL,     -- 표시 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 일별 시술 기록 테이블
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  count INTEGER NOT NULL CHECK (count > 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, treatment_id)  -- 같은 날짜에 같은 시술은 1개만
);

-- 3. 지출 항목 테이블
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,                    -- 이모지 (선택)
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 월별 지출 테이블
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL,     -- 'YYYY-MM' 형식
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year_month, category_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_daily_records_treatment_id ON daily_records(treatment_id);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_year_month ON monthly_expenses(year_month);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_category_id ON monthly_expenses(category_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- treatments 테이블에 트리거 설정
DROP TRIGGER IF EXISTS update_treatments_updated_at ON treatments;
CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (테스트용 - 선택사항)
INSERT INTO treatments (name, price, icon, color, "order")
VALUES
  ('네일아트', 50000, '💅', '#FF3B30', 1),
  ('왁싱', 30000, '🪒', '#FF9500', 2),
  ('속눈썹', 40000, '👁️', '#34C759', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO expense_categories (name, icon, "order")
VALUES
  ('월세', '🏠', 1),
  ('재료비', '🛍️', 2),
  ('마케팅비', '📢', 3)
ON CONFLICT (name) DO NOTHING;
