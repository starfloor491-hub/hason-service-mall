# HASON COMPANY 서비스몰 - 통합 확장 버전

## 추가된 서비스 상세페이지
- 반응형 홈페이지 제작
- 기업 보도자료 작성
- 회사소개서·제안서 PPT
- 대표자 프로필·인터뷰 원고
- 홈페이지 문구 작성
- 브랜드 컨설팅
- 나무위키 문서 작성·정리
- 위키백과 등재 검토·초안
- 기업 블로그 콘텐츠 작성

## 추가 기능
- 각 서비스별 독립 상세페이지
- 각 상세페이지 3단계 가격 옵션
- 상세페이지 옵션 선택 → 메인 주문서 자동 반영
- 이용안내 / 개인정보처리방침 / 취소·환불 기준 페이지
- D1 바인딩이 wrangler.jsonc에 포함되어 재배포 후에도 유지

## 업로드
GitHub `hason-service-mall` 저장소 루트에 이 ZIP을 풀어 나온 내용물을 그대로 덮어쓰고 Commit changes 하세요.
Cloudflare가 자동 배포합니다.

`ADMIN_TOKEN`은 Runtime variables and secrets에 Secret으로 유지하세요.


## 추가 수정 사항
- 메인 서비스 카드 9종에 실사형 이미지 적용
- 각 서비스 상세페이지 상단 비주얼에 동일한 서비스 이미지 적용
- 이미지 파일 경로: `public/assets/services/*.png`


## 상담/결제 안내 추가
- 카카오톡 오픈채팅 연결: https://open.kakao.com/o/silMvyJi
- 상단 메뉴 상담문의
- 메인 CTA 카톡 상담하기
- 각 서비스 상세페이지 카카오톡 상담 버튼
- 모바일/PC 고정 플로팅 상담 버튼
- 세금계산서 발행 가능 / 작업 완료 후 후불 정산 기본 안내 문구 추가


## 주문 접수 이메일 자동 알림
주문이 D1에 정상 저장된 직후 Resend API를 통해 관리자 이메일로 자동 알림을 보냅니다. 이메일 발송이 실패해도 주문 접수 자체는 정상 완료됩니다.

Cloudflare Worker → Settings → Runtime variables and secrets에 아래 값을 추가하세요.
- `RESEND_API_KEY` : Secret / Resend에서 발급한 API Key
- `ORDER_NOTIFY_EMAIL` : 주문 알림을 받을 이메일 주소
- `ORDER_FROM_EMAIL` : 발신자 주소(권장: `HASON COMPANY <orders@hasoncompany.kr>`). 미설정 시 테스트용 `HASON COMPANY <onboarding@resend.dev>` 사용

실서비스에서는 Resend에서 `hasoncompany.kr` 도메인을 인증한 뒤 `ORDER_FROM_EMAIL`을 설정하는 것을 권장합니다. 기존 `ADMIN_TOKEN`, `DB`, `ASSETS` 설정은 그대로 유지하세요.
