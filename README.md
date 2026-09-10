# HASON COMPANY 서비스몰 - Cloudflare Workers용

현재 생성된 `hason-service-mall` Workers 프로젝트에 맞춘 버전입니다.

## 구성
- src/worker.js : 주문 API + 관리자 API + 정적파일 라우팅
- public/index.html : 서비스몰 메인
- public/admin.html : 관리자 페이지
- schema.sql : D1 주문 테이블
- wrangler.jsonc : Workers + Static Assets 설정
- package.json : Wrangler 배포 설정

## 다음 순서
1. GitHub 저장소의 기존 파일을 이 ZIP 내용으로 교체
2. Cloudflare에서 D1 DB 생성
3. schema.sql 실행
4. h​ason-service-mall > Bindings > Add binding > D1 database
   - Variable name: DB
5. Settings/Variables에서 ADMIN_TOKEN을 Secret으로 추가
6. workers.dev URL 또는 shop.hasoncompany.kr 연결
7. 재배포 후 주문 테스트

## 관리자
`/admin.html` 접속 후 ADMIN_TOKEN 입력

## 결제
현재는 주문 접수/조회/관리까지 작동하는 MVP입니다.
카드·간편결제는 PG 계약 후 추가 연결하면 됩니다.
