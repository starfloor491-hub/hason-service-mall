# HASON COMPANY 서비스몰 운영형 MVP

이 버전은 단순 화면 샘플이 아니라 Cloudflare Pages + D1을 사용해 실제 주문을 저장하고 조회할 수 있도록 구성되어 있습니다.

## 현재 작동하는 기능
- 서비스 선택 및 주문 접수
- Cloudflare D1 DB에 주문 저장
- 주문번호 자동 발급
- 고객 주문조회: 주문번호 + 연락처
- 관리자 주문목록 조회
- 관리자 상태 변경: 접수 / 작업중 / 수정중 / 완료 / 취소
- 관리자 메모
- PC/모바일 반응형 화면

## 아직 연결하지 않은 기능
- 카드/간편결제(PG)
- 파일 첨부
- 문자/카카오 알림
- 회원가입/로그인
- 고객별 마이페이지

## Cloudflare Pages에 배포하는 순서

1. 이 폴더 전체를 GitHub 저장소에 올리거나 Cloudflare Pages 프로젝트에 연결합니다.
2. Cloudflare 대시보드에서 D1 Database를 새로 만듭니다.
3. D1 콘솔에서 `schema.sql` 내용을 실행합니다.
4. Pages 프로젝트 Settings > Bindings에서 D1 binding을 추가합니다.
   - Variable name: `DB`
   - 생성한 D1 database 선택
5. Pages 프로젝트의 Environment Variables / Secrets에 관리자 토큰을 추가합니다.
   - 이름: `ADMIN_TOKEN`
   - 값: 본인만 아는 긴 랜덤 문자열
6. 다시 Deploy 합니다.
7. 메인 주소에서 주문 테스트 후 `/admin.html` 에 접속해 ADMIN_TOKEN으로 주문을 확인합니다.
8. 정상 작동하면 `shop.hasoncompany.kr` 같은 Custom Domain을 연결합니다.

## 중요
`ADMIN_TOKEN`은 HTML 코드에 직접 적지 마세요. 반드시 Cloudflare의 Secret/Environment Variable로 저장하세요.

## 결제 연결
카드 결제까지 받으려면 국내 PG 계약이 필요합니다. PG사 선정 후 결제창 호출 → 결제 승인 검증 → 주문 상태를 `결제완료`로 바꾸는 API를 추가하면 됩니다.
