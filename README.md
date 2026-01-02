# KIMUU - 뷰티샵 매출 관리 앱

> 개인 뷰티샵(네일, 속눈썹 등)의 일별 시술 기록과 월별 결산을 관리하는 PWA 애플리케이션

## 📱 주요 기능

### 1️⃣ 캘린더 탭
- **월별 캘린더 뷰**: 일별 매출 금액 표시
- **월 총 매출**: 상단에 한눈에 표시
- **일별 상세 기록**:
  - 시술 추가 (시술별 색상, 아이콘, 가격)
  - 시술 수량 조절 (증가/감소)
  - 조정 금액 (할인/추가금액) 입력

### 2️⃣ 결산 탭
- **월별 매출**: 총 시술 매출 표시
- **총 지출**: 카테고리별 지출 관리
- **순이익 계산**: 매출 - 지출
- **지출 카테고리 관리**: 이모지와 함께 항목 추가/수정/삭제
- **이전 달 불러오기**: 전월 지출 데이터를 현재 달로 복사 (고정 지출 관리 편의성)

### 3️⃣ 설정 탭
- **시술 관리**: 시술 항목 추가/수정/삭제
- **시술 커스터마이징**: 이름, 가격, 색상, 이모지 설정
- **데이터 관리**: 전체 데이터 내보내기/불러오기 (JSON)

## 🎨 디자인 시스템

### 컬러 테마
- **핑크 계열** (포인트 컬러):
  - Primary: `#FFA0B9` - 메인 핑크 (버튼)
  - Primary Dark: `#F28AA5` - 어두운 핑크 (호버)
  - Primary Light: `#FFCFDD` - 연한 핑크 (배지, 칩)

- **브라운 계열** (메인 컬러):
  - Accent: `#FBF9F7` - 거의 화이트 (매출 카드)
  - Accent Dark: `#7C5E4A` - 다크 브라운 (강조)
  - Accent Light: `#F5E6D3` - 밀크 베이지
  - Accent Hover: `#B89A7D` - 호버 브라운

- **배경**:
  - Background: `#FEFAF7` - 아이보리 배경
  - Card: `#FFFFFF` - 화이트 카드
  - Highlight: `#F5E6D3` - 밀크 베이지 하이라이트

- **텍스트**:
  - Text Primary: `#2C2420` - 브라운 블랙
  - Text Secondary: `#7C5E4A` - 다크 브라운
  - Text Tertiary: `#A0826D` - 모카 브라운
  - Text Accent: `#FFA0B9` - 핑크 강조

## 🛠️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **date-fns** - 날짜 처리
- **lucide-react** - 아이콘

### Backend & Database
- **Supabase** - PostgreSQL + Auth + Storage
- **@tanstack/react-query** - 서버 상태 관리

### PWA
- **vite-plugin-pwa** - PWA 설정
- **workbox** - 서비스 워커

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프리뷰
npm run preview
```

## 🗄️ 데이터베이스 스키마

### treatments (시술 항목)
- `id`: UUID (PK)
- `name`: 시술명
- `price`: 가격
- `color`: 색상 코드
- `icon`: 이모지
- `order`: 정렬 순서

### daily_records (일별 시술 기록)
- `id`: UUID (PK)
- `date`: 날짜 (YYYY-MM-DD)
- `treatment_id`: 시술 FK
- `count`: 수량
- `total_amount`: 총 금액

### daily_adjustments (일별 조정)
- `id`: UUID (PK)
- `date`: 날짜
- `amount`: 금액 (음수=할인, 양수=추가)
- `reason`: 사유

### expense_categories (지출 항목)
- `id`: UUID (PK)
- `name`: 항목명
- `icon`: 이모지
- `order`: 정렬 순서

### monthly_expenses (월별 지출)
- `id`: UUID (PK)
- `year_month`: 년월 (YYYY-MM)
- `category_id`: 항목 FK
- `amount`: 금액

## 🔒 보안

### 현재 (단일 사용자)
- RLS (Row Level Security) 활성화
- anon 키로 모든 데이터 접근 허용
- 개인 사용 목적으로 적합

### 향후 (멀티 테넌트)
- 구현 계획은 [MULTI_TENANT_IMPLEMENTATION.md](./MULTI_TENANT_IMPLEMENTATION.md) 참고
- Google OAuth 인증
- `user_id` 기반 데이터 격리
- RLS 정책을 `authenticated` + `user_id` 검증으로 전환

## 📝 최근 업데이트

### 2025-12-12
#### 이전 달 지출 불러오기 기능
- ✅ 결산 탭에 "🔄 이전 달 불러오기" 버튼 추가
- ✅ 전월 지출 데이터 일괄 복사 (월세, 재료비 등 고정 지출 관리 편의성)
- ✅ 1월의 경우 전년도 12월 데이터 조회
- ✅ 데이터 덮어쓰기 확인 및 복사 건수 알림

#### PWA 앱 브랜딩
- ✅ 앱 이름 변경: "KI계부" → **"KIMUU"**
- ✅ PWA 아이콘 추가 (4가지 크기)

#### Sheet 컴포넌트 입력 안정성 개선
- ✅ 모바일 키보드 입력 시 Sheet 위치 완벽 안정화
- ✅ 모든 Sheet를 90% 고정 높이 순수 CSS 방식으로 전환
- ✅ Layer 간섭 문제 해결 (isInBackground prop 추가)
- ✅ z-index stacking order 수정으로 터치 이벤트 정상 작동
- ✅ Sheet 내부 스크롤 활성화 (flex container 구조)
- ❌ 드래그 확장/축소 기능 제거 (입력 안정성 우선)

**주요 기술 결정**:
- 5가지 해결 방안 시도 후 순수 CSS 방식 선택
- vaul 드래그 기능 포기 → 입력 필드 안정성 확보
- 모든 바텀시트가 90% 고정 높이로 일관된 UX 제공

### 2025-12-05
#### Sheet 컴포넌트 개선 (vaul 라이브러리)
- ✅ 드래그로 바텀시트 확장/축소 기능 추가 (현재 제거됨)
- ✅ 시술 내역이 적어도 내부 스크롤 가능
- ✅ 뒤쪽 캘린더에 터치 이벤트 전달 차단

#### 컬러 테마 정리
- ✅ tailwind.config.js conflict 해결
- ✅ accent 색상 #FBF9F7 (거의 화이트) 최종 선택
- ✅ main 브랜치 추가 컬러 병합 (accentDark, highlight, textAccent)

### 이전 업데이트
- 2025-11-XX: 핑크-브라운 컬러 테마 전면 리팩토링
- 2025-11-XX: 멀티 테넌트 구현 계획 문서화
- 2025-11-XX: Supabase RLS 보안 설정

**상세 변경 이력**: [CHANGELOG.md](./CHANGELOG.md) 참고

## 🚀 배포

- Vercel / Netlify 등에서 정적 사이트 호스팅
- 환경 변수 설정 필요:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 📄 라이센스

개인 프로젝트

## 👤 작성자

tei-young
