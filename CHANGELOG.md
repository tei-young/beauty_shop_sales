# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

## [2025-12-05] - Sheet 컴포넌트 UX 개선

### Added
- **vaul 라이브러리 통합**: 검증된 바텀시트/드로워 라이브러리 도입
- **드래그로 바텀시트 확장/축소**: 사용자가 상단 핸들을 드래그하여 시트 크기 조절 가능
- **snapPoints 기능**:
  - 초기 높이: 화면의 50%
  - 확장 높이: 화면의 90%
  - 자동 스냅 포인트 적용

### Fixed
- **터치 이벤트 충돌 해결**: 시술 내역이 적을 때 바텀시트 영역 터치 시 뒤쪽 캘린더에 이벤트 전달되던 문제 수정
- **내부 스크롤 활성화**: 컨텐츠가 적어도 바텀시트 내부 스크롤 가능
- **높이 고정**: `max-h-[90vh]`에서 `h-[90vh]`로 변경하여 일관된 높이 유지

### Changed
- Sheet 컴포넌트 구조 변경:
  - `Drawer.Root`, `Drawer.Portal`, `Drawer.Content` 사용
  - 콘텐츠 영역을 `flex-1 + overflow-y-auto`로 설정

### Technical Details
- 의존성 추가: `vaul@^2.1.10`
- 파일 수정: `src/components/Sheet.tsx`
- React 19 호환 확인 완료

---

## [2025-12-05] - 컬러 테마 최종 조정

### Fixed
- **tailwind.config.js conflict 해결**:
  - main 브랜치와 feature 브랜치 간 충돌 해결
  - accent 색상 #FBF9F7 (거의 화이트) 유지
  - main 브랜치 추가 컬러 병합 (accentDark, highlight, textAccent)

### Changed
- **방안 C 최종 선택**: 럭셔리 느낌 (브라운 70% + 핑크 30%)
  - Background: `#FEFAF7` (아이보리)
  - Accent (매출 카드): `#FBF9F7` (거의 화이트)
  - Primary (버튼): `#FFA0B9` (핑크)

---

## [2025-11-XX] - 핑크-브라운 컬러 테마 전면 리팩토링

### Added
- **새로운 컬러 시스템 구축**:
  - 핑크 계열 3단계 (primary, primaryDark, primaryLight)
  - 브라운 계열 4단계 (accent, accentDark, accentLight, accentHover)
  - 텍스트 4단계 (textPrimary, textSecondary, textTertiary, textAccent)

### Changed
- **A/B/C 테스트 진행**:
  - 방안 A: 핑크 80% + 베이지 20% (부드러운 느낌)
  - 방안 B: 핑크 50% + 브라운 50% (균형잡힌 조화)
  - 방안 C: 브라운 70% + 핑크 30% (럭셔리 느낌) ✅ 최종 선택
- 기존 블루 테마에서 핑크-브라운 테마로 전환
- PWA theme-color 변경: `#3B82F6` → `#FFA0B9`

---

## [2025-11-XX] - 멀티 테넌트 구현 계획 수립

### Added
- **MULTI_TENANT_IMPLEMENTATION.md** 문서 생성
  - 데이터베이스 마이그레이션 계획
  - RLS 정책 변경 사항
  - 인증 시스템 설계 (Google OAuth)
  - 코드 수정 가이드

### Documentation
- 향후 10-50명 사용자 지원을 위한 로드맵
- user_id 기반 데이터 격리 방안
- 단계별 마이그레이션 계획

---

## [2025-11-XX] - Supabase RLS 보안 설정

### Added
- **Row Level Security (RLS) 활성화**
  - treatments 테이블 RLS 정책 적용
  - daily_records, daily_adjustments 테이블 정책 추가
  - expense_categories, monthly_expenses 테이블 정책 추가

### Changed
- 모든 테이블에 anon 역할 접근 허용 정책 적용
- 단일 사용자 환경에 맞는 보안 레벨 설정

### Security
- Supabase anon key로 모든 CRUD 작업 가능
- 개인 사용 목적으로 적절한 보안 수준 유지
- 향후 멀티 테넌트 전환 시 authenticated 정책으로 변경 예정

---

## 향후 계획 (TODO)

### 기능 개선
- [ ] 차트/그래프 추가 (월별 매출 트렌드)
- [ ] 엑셀 내보내기 기능
- [ ] 고객 관리 기능 (선택 사항)
- [ ] 알림 기능 (예약 리마인더 등)

### 기술 개선
- [ ] 번들 사이즈 최적화 (현재 532KB → 목표 300KB 이하)
- [ ] 코드 스플리팅 적용
- [ ] 이미지 최적화
- [ ] 성능 모니터링 도입

### 멀티 테넌트 전환 (장기)
- [ ] Google OAuth 인증 구현
- [ ] user_id 컬럼 추가 마이그레이션
- [ ] RLS 정책 업데이트
- [ ] 사용자별 데이터 격리 테스트
- [ ] 결제 시스템 연동 (구독 모델)

---

## 버전 관리 규칙

### Commit Message Convention
- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `style:` - 디자인/스타일 변경
- `refactor:` - 코드 리팩토링
- `docs:` - 문서 업데이트
- `test:` - 테스트 추가/수정
- `chore:` - 빌드/설정 변경
- `merge:` - 브랜치 병합

### Branch Naming
- `main` - 프로덕션 브랜치
- `claude/*` - 개발 브랜치

---

**마지막 업데이트**: 2025-12-05
