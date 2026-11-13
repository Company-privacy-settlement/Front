# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

NEAR 기업 프라이버시 정산의 Next.js 문서 사이트와 지갑 인터페이스입니다. **사이트·Docs의 기본 언어는 영어**이며 README는 한국어·영어·중국어를 제공합니다. 인터랙티브 시뮬레이션은 제거하고 랜딩의 진입을 Docs와 설정형 테스트넷 워크스페이스로 바꿨습니다.

## 문서

`/docs/`는 Getting started, Architecture, Payments & fees, Invoices & checkout, Groups & capacity, Privacy & evidence, Business verification, SDK & API, Recovery & limits의 9개 영문 가이드를 제공합니다. 검색, 목차, 섹션 링크, 이전·다음 탐색, 모바일 메뉴가 포함됩니다. 콘텐츠는 `src/lib/docs.ts`에 있습니다. 기존 `/app/` 링크는 관련 Docs로 연결되며 시뮬레이션 대시보드를 표시하지 않습니다.

랜딩·문서·앱은 검정·흰색·초록의 NEAR 톤을 사용합니다. 제목 위 장식 라벨은 없으며 화면 높이에 맞춘 읽기 영역만 스크롤합니다. 표·코드는 작은 화면에서 내부 가로 스크롤로 접근합니다.

## 실행·검증

Node.js 22 이상이 필요합니다.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

빌드 결과는 `out/`이며 다른 저장소 없이 빌드합니다. 문서·기존 링크·인보이스·공개 거래 내역·지갑 복구·KYB·작은 화면을 브라우저 테스트로 검증합니다.

## 실제 연결 범위

`/live/`는 독립적으로 신뢰한 정책과 일치하는 Core API·인덱스에 연결해 테스트넷 FT 지갑 호출을 검토·승인합니다. 호스팅된 Front에는 접근 가능한 HTTPS API와 정확한 CORS 출처가 필요합니다. 자금이 준비된 공개 배포는 포함하지 않습니다.

노트 생성과 증명은 로컬 CLI에서 처리하고 브라우저는 공개 지급 계획을 가져옵니다. 암호화 작업 기록은 지출 가능한 비밀 노트의 백업이 아닙니다. 서명 결과가 불확실하면 원래 TX나 바인딩된 확정 상태를 확인할 때까지 재서명을 차단합니다. 자동 재송금·암호 복구는 없습니다.

`/invoices/`는 수취인 NEP-413 서명 인보이스를 발행하고 `/pay/#invoice=...`에서 결제합니다. v2는 결제 단위별 별도 참조를 사용하고 v1은 호환 유지합니다. 정책·현재 FullAccess 서명 키·증명의 목적지·지급 합계·지연 여부·참조 재사용·수집 범위를 대조합니다. 만료·참조 단일 사용은 앱의 규칙이며 동시 지급·지연 지급·과입금은 발생할 수 있습니다. 조회 실패·신뢰 변경 시 이전 상태를 비우고 늦은 응답을 무시합니다.

인보이스 JSON은 떠나기 전에 저장하세요. 서버 인보이스함·원금 수탁·웹훅·법정통화 환전·자동 환불은 없습니다. 링크 보유자와 API는 참조를 연결할 수 있고 현재 호스팅 접근 범위는 소유자 전용입니다.

## KYB·프로토콜 범위

`/kyb/`는 미국·아부다비 본토·ADGM의 6페이지 샘플 준비 흐름입니다. 입력은 메모리에만 남고 새로고침·화면 이탈로 소실됩니다. 문서 내용은 읽거나 업로드하지 않습니다. 준비 결과는 `verified: false`, `credentialIssued: false`, `providerSubmission: not_sent`이며 외부 심사·인증서·결제 자격을 부여하지 않습니다. AI 세무·법률 준비와 신고는 후속 연동입니다.

원금은 독립 볼트에 남고 공유 ZK 노트로 한 볼트에서 직접 지급합니다. 원금이 여러 볼트를 연속 경유하지 않습니다. 수취인·금액·시간·서명자·볼트·참조는 공개되며 그룹은 고정 금액과 총 256개 출력을 지원합니다. 운영 보안 감사는 수행되지 않았습니다.

Core SDK는 SHA-256 매니페스트와 함께 `src/vendor/core-client/`에 보관합니다. Core의 `npm run build:client` 후 Front의 `npm run sync:core`로 갱신합니다.

[Contract](https://github.com/Company-privacy-settlement/Contract) · [Core](https://github.com/Company-privacy-settlement/Core) · [Front](https://github.com/Company-privacy-settlement/Front)

승인된 그룹 목록을 가져오면 그룹별 API 정책·출력 용량을 검증하고 입금 또는 복구 모드로 선택할 수 있습니다. 복구 모드는 새 입금 가져오기를 막으며, 저널이 열려 있을 때는 그룹 변경을 잠급니다. [그룹 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/GROUPS.md)를 참고하세요.

인보이스 페이지에 선택형 암호화 로컬 보관함을 추가했습니다. 서명 요청을 명시적으로 저장하고 검색·다시 열기·암호화 백업 내보내기·복원·병합할 수 있습니다. 계정·네트워크별 저장소와 서명 ID 불변성을 검증하며 서버로 거래 조건을 보내거나 결제 완료 상태를 저장하지 않습니다. [보관함 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICE_LIBRARY.md)를 참고하세요.
