# 멀티 테넌트 구현 계획

> 현재 단일 사용자 앱을 여러 뷰티샵 원장님들이 사용할 수 있도록 확장하는 계획

## 📋 목표

- **사용자 수**: 10~50명 예상
- **데이터 격리**: 각 원장님의 시술 기록과 매출이 완전히 분리
- **인증 방식**: 구글 로그인 (최초 1회) + 자동 로그인 (이후)
- **보안**: Row Level Security (RLS)로 DB 레벨 데이터 격리

---

## 🚨 현재 보안 상태

### Supabase RLS 경고
- `treatments` 테이블을 포함한 모든 테이블에서 RLS가 비활성화되어 있음
- 현재는 `anon` 역할에 모든 권한 부여 (임시 조치)
- **⚠️ 멀티 테넌트 전환 전 반드시 변경 필요**

### 현재 적용된 임시 RLS 정책
```sql
-- 모든 테이블에 동일하게 적용됨
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY treatments_anon_all ON public.treatments
FOR ALL TO anon
USING (true)
WITH CHECK (true);
```

---

## ✅ 구현 단계

### Phase 1: 데이터베이스 마이그레이션 (필수)

**1-1. user_id 컬럼 추가**
```sql
ALTER TABLE treatments ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE daily_records ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE expense_categories ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE monthly_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE daily_adjustments ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

**1-2. 기존 데이터 마이그레이션**
```sql
-- 첫 번째 사용자로 구글 로그인 후 user_id 확인
-- 기존 데이터를 해당 user_id로 업데이트
UPDATE treatments SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE daily_records SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE expense_categories SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE monthly_expenses SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE daily_adjustments SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
```

**1-3. NOT NULL 제약조건 추가**
```sql
ALTER TABLE treatments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE daily_records ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE expense_categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE monthly_expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE daily_adjustments ALTER COLUMN user_id SET NOT NULL;
```

**1-4. 성능 최적화 인덱스**
```sql
CREATE INDEX idx_treatments_user_id ON treatments(user_id);
CREATE INDEX idx_daily_records_user_id ON daily_records(user_id);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX idx_monthly_expenses_user_id ON monthly_expenses(user_id);
CREATE INDEX idx_daily_adjustments_user_id ON daily_adjustments(user_id);
```

**1-5. UNIQUE 제약조건 수정 (사용자별 격리)**
```sql
-- treatments: 같은 사용자 내에서만 시술명 unique
ALTER TABLE treatments DROP CONSTRAINT treatments_name_key;
ALTER TABLE treatments ADD CONSTRAINT treatments_user_name_unique
  UNIQUE(user_id, name);

-- expense_categories: 같은 사용자 내에서만 지출항목명 unique
ALTER TABLE expense_categories DROP CONSTRAINT expense_categories_name_key;
ALTER TABLE expense_categories ADD CONSTRAINT expense_categories_user_name_unique
  UNIQUE(user_id, name);

-- daily_records: 사용자별 날짜+시술 unique
ALTER TABLE daily_records DROP CONSTRAINT daily_records_date_treatment_id_key;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_user_date_treatment_unique
  UNIQUE(user_id, date, treatment_id);

-- monthly_expenses: 사용자별 월+지출항목 unique
ALTER TABLE monthly_expenses DROP CONSTRAINT monthly_expenses_year_month_category_id_key;
ALTER TABLE monthly_expenses ADD CONSTRAINT monthly_expenses_user_month_category_unique
  UNIQUE(user_id, year_month, category_id);
```

---

### Phase 2: RLS 정책 변경 (보안 핵심)

**2-1. 기존 anon 정책 삭제**
```sql
DROP POLICY IF EXISTS treatments_anon_all ON treatments;
DROP POLICY IF EXISTS daily_records_anon_all ON daily_records;
DROP POLICY IF EXISTS expense_categories_anon_all ON expense_categories;
DROP POLICY IF EXISTS monthly_expenses_anon_all ON monthly_expenses;
DROP POLICY IF EXISTS daily_adjustments_anon_all ON daily_adjustments;
```

**2-2. 사용자 격리 정책 생성**
```sql
-- 각 사용자는 본인 데이터만 접근 가능
CREATE POLICY treatments_user_isolation ON treatments
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY daily_records_user_isolation ON daily_records
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY expense_categories_user_isolation ON expense_categories
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY monthly_expenses_user_isolation ON monthly_expenses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY daily_adjustments_user_isolation ON daily_adjustments
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

### Phase 3: 코드 수정

**3-1. TypeScript 타입 업데이트** (`src/types/index.ts`)
```typescript
// 모든 Row 타입에 user_id 추가
export interface TreatmentRow {
  id: string;
  user_id: string;  // 추가
  name: string;
  price: number;
  icon: string | null;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// DailyRecordRow, ExpenseCategoryRow, MonthlyExpenseRow,
// DailyAdjustmentRow 모두 동일하게 user_id 추가
```

**3-2. Hooks 수정 (INSERT 시 user_id 자동 추가)**

수정 필요 파일:
- `src/hooks/useTreatments.ts`
- `src/hooks/useDailyRecords.ts`
- `src/hooks/useExpenseCategories.ts`
- `src/hooks/useMonthlyExpenses.ts`
- `src/hooks/useDailyAdjustments.ts`

예시 (`useTreatments.ts`):
```typescript
export function useAddTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treatment: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>) => {
      // 현재 로그인된 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('treatments')
        .insert({
          ...treatment,
          user_id: user.id  // user_id 자동 추가
        })
        .select()
        .single();

      if (error) throw error;
      return data as Treatment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}
```

---

### Phase 4: 구글 로그인 추가

**4-1. 로그인 페이지 생성** (`src/pages/LoginPage.tsx`)
```typescript
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert('로그인 실패: ' + error.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <h1>뷰티샵 매출 관리</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔐 구글로 로그인
      </button>
    </div>
  );
}
```

**4-2. App.tsx에 세션 관리 추가**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  // 기존 앱 UI
  return <div>{/* 기존 컴포넌트 */}</div>;
}

export default App;
```

**4-3. Supabase Dashboard 설정**
1. Authentication → Providers → Google 활성화
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
3. Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Client ID / Secret을 Supabase에 입력

---

## 🔒 보안 아키텍처

```
┌─────────────────────────────────────────┐
│  인증 레이어 (Authentication)            │
├─────────────────────────────────────────┤
│  - 구글 OAuth (Supabase Auth)           │
│  - 최초 1회 로그인                       │
│  - 세션 7일 유효 (자동 갱신)             │
│  - localStorage에 암호화 저장            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  데이터 격리 레이어 (RLS)               │
├─────────────────────────────────────────┤
│  user_id = auth.uid()                   │
│  - 모든 쿼리에 자동 필터링              │
│  - DB 레벨에서 완전 격리                │
│  - 클라이언트 코드 우회 불가            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  기기 보안 (OS 레벨)                    │
├─────────────────────────────────────────┤
│  - iOS/Android Face ID/PIN              │
│  - PWA 앱 자동 연동                     │
│  - 별도 구현 불필요                     │
└─────────────────────────────────────────┘
```

---

## 📊 작업 시간 예상

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| 1 | DB 마이그레이션 | 5분 |
| 2 | RLS 정책 변경 | 2분 |
| 3 | 코드 수정 (타입 + hooks) | 20분 |
| 4 | 구글 로그인 + Supabase 설정 | 30분 |
| **합계** | | **~1시간** |

---

## 🎯 사용자 경험 (구현 후)

```
첫 실행:
  ↓
구글 로그인 (1회만)
  ↓
Supabase 세션 생성
  ↓
앱 사용

───────────────────

이후 실행:
  ↓
앱 열기 (PWA)
  ↓
iOS/Android Face ID (OS 자동)
  ↓
자동 로그인
  ↓
앱 바로 사용
```

---

## ⚠️ 주의사항

### 반드시 지켜야 할 순서
1. **DB 백업 먼저!** (기존 데이터 보존)
2. Phase 1 완료 후 Phase 2 진행 (RLS 정책 변경 전 user_id 필수)
3. Phase 3 완료 후 Phase 4 진행 (코드 수정 없이 로그인만 추가하면 에러 발생)

### 데이터 무결성
- user_id가 없는 데이터는 조회 불가 (RLS로 필터링됨)
- 기존 데이터 마이그레이션 필수

### 테스트 계획
1. 테스트 계정 2개로 로그인
2. 각 계정에서 시술 추가/조회
3. 상대방 데이터가 보이지 않는지 확인
4. 브라우저 개발자 도구로 다른 user_id 조회 시도 (차단되는지 확인)

---

## 🚀 추후 확장 가능 기능

- [ ] 로그아웃 기능
- [ ] 사용자 프로필 화면
- [ ] 데이터 백업/내보내기
- [ ] 푸시 알림
- [ ] 오프라인 모드 개선
- [ ] 다국어 지원

---

## 📝 참고 문서

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
