# Core Front — NEAR 기업 결제

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

Core의 랜딩, 문서와 지갑 도구입니다. 기업 간·기업과 근로자 간 프라이빗 정산을 위한 개발 프로토콜이며 Next.js로 구현했습니다. 컨트랙트, 증명 생성, 서버·인덱서는 별도 저장소에서 관리합니다.

[서비스 개요](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md) · [웹 Docs](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/) · [개발 로드맵](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)

동기화된 SDK의 `OrganizationInvoiceClient`는 조직별 암호화 인보이스 저장·조회와 중복 방지를 지원합니다. 권한 표와 영문 Docs에 인보이스 접근·키 설정을 반영했습니다. 기존 로컬 인보이스 폼·라이브러리는 API에 자동 동기화되지 않습니다. [Core API 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATION_INVOICES.md).

Organization → Invoice payments에서 전체 조직 인보이스 검색, 상태·자산·그룹·발행일 필터, CSV·JSON 내보내기, 서명 JSON 저장과 확정 인덱스 기반 조회를 지원합니다. 신뢰한 정책·API를 별도 선택하며 미조회·실패·오래된 인덱스·불완전한 결과를 명시합니다. [대시보드 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PAYMENT_DASHBOARD.md).

Organization → Webhooks에서 확정 결제 콜백, 서명 키 교체, 전송 시도·실패 내역과 버전 기반 재시도를 관리합니다. Owner/Admin은 관리, Operator/Auditor는 조회하며 Viewer는 접근할 수 없습니다. 브라우저에 서명 비밀키를 영속 저장하지 않습니다. [워커·수신 측 설정](https://github.com/Company-privacy-settlement/Core/blob/main/docs/WEBHOOKS.md).

Organization → Payouts에서 근로자·계약자 배치, 수취인별 승인·수수료, 공유 암호화 저널, 원래 목적지 개별 복구와 관측 기반 정산 내보내기를 관리합니다. 별도로 신뢰한 테스트넷 FT 정책·API와 서로 다른 충전 노트의 공개 매니페스트를 가져옵니다. [송금 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PAYOUT_BATCHES.md).

## 워크스페이스

| 경로 | 현재 기능 |
| --- | --- |
| `/` | 서비스 랜딩과 문서 진입 |
| `/docs/` | 시작, 구조, 수수료, 인보이스, 그룹, 프라이버시, KYB, SDK/API, 복구, 조직의 영문 가이드 10개 |
| `/live/` | 독립적으로 설정한 테스트넷 FT 정산, 지갑 호출 검토, 암호화 저널과 공개 인덱스 활동 |
| `/notes/` | 로컬 FT 노트 생성, 암호화 백업·재열기, 선택적 공개 루트 가져오기와 공개 입금 플랜 준비 |
| `/invoices/` | 결제 단위별 참조를 갖는 수취인 NEP-413 서명 요청, 선택적 로컬 암호화 인보이스 보관함 |
| `/pay/#invoice=…` | 서명 결제, 수취인 준비 상태, 출금 플랜의 정확한 바인딩과 최종화된 정산 조회 |
| `/evidence/` | 비공개 영수증, 암호화 백업, 선택 필드 증명과 별도로 신뢰한 루트에 대한 무결성 검사 |
| `/kyb/` | 개요·기업·소유자/관계자·문서·검토·상태의 샘플 입력 6단계 |
| `/organization/` | 별도 Organization API를 통한 조직·멤버·초대·역할·소유권·감사 기록 관리 |
| `/app/` | 기존 경로를 해당 Docs로 이동 |

사이트와 웹 Docs의 기본 언어는 영어입니다. README는 한국어·중국어도 지원합니다. 랜딩·앱·Docs는 검정·흰색·초록 톤과 모바일 가로 넘침 방지, 내부 콘텐츠 스크롤을 공유합니다. 웹 가이드 원본은 `src/lib/docs.ts`입니다.

**Local proofs** (`/prove/`)는 로컬 워커에서 FT 출금 증명을 생성하고 독립 아티팩트 해시와 정책 검증기 바이트를 확인합니다. 취소와 내려받은 증명 파일 검증도 지원합니다. [설정·신뢰 모델](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_PROVER.md). [인보이스 결제](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICE_PAYMENTS.md)에서 원래 그룹의 암호화 노트 선택 → 로컬 증명 → 금액·수수료 확인 → 개별 지갑 승인 → 최종화 결제 확인을 지원합니다. 선택 단위 고정, 취소, 서명 직전 기업 키·상태 재검사와 보수적 복구를 적용합니다.

## 실행과 검증

Node.js 22 이상이 필요합니다.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

정적 결과물은 `out/`입니다. 빌드는 내장 Core 브라우저 번들·타입 선언의 SHA-256 매니페스트를 검증하며 형제 저장소나 API 키 없이 실행됩니다. Core 변경 후 Core에서 `npm run build:client`, 여기서 `npm run sync:core`를 실행합니다. 테스트는 Docs, 모바일 레이아웃, 인보이스, 수취인 준비, 증빙, 노트, 지갑 복구, 저널과 샘플 KYB를 다룹니다. 2026-11-13 전체 브라우저 실행에서 실제 증명 아티팩트를 사용한 데스크톱/모바일 164개 케이스가 통과했습니다. [검증 범위](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md).

## 조직과 접근 권한

Organization에서 독립 운영하는 Organization API 주소를 입력하고 NEP-413 지원 테스트넷 지갑으로 로그인합니다. 조직 생성·선택, 계정 지정 초대·수락, 허용된 멤버 역할 변경과 감사 기록을 관리합니다. 토큰은 메모리에만 두며 페이지 숨김·API 주소 변경 시 삭제합니다. Owner/Admin/Operator/Viewer/Auditor 권한은 서버에서 검사하고 지갑 서명·KYB·호스팅 접근 범위와 구분합니다. 별도 백엔드 배포가 필요하며 공개 기업 서버를 기본 제공하지 않습니다. [설정과 한계](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATIONS.md).

[조직 데이터 백업·복구](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATION_BACKUPS.md)는 일관된 온라인 스냅샷, 세션·챌린지 폐기와 격리 복구를 제공합니다. 현재 권한을 별도 승인한 파일을 적용해야 새 운영 DB로 활성화되며, 과거 소유자·역할·대기 초대는 자동으로 권한에 복원하지 않습니다.

[기업 결제 승인](https://github.com/Company-privacy-settlement/Core/blob/main/docs/CORPORATE_PAYMENTS.md)은 작성자와 다른 Owner/Admin 승인자를 분리하고 결제·별도 0.15% 수수료·선행 호출을 고정합니다. 지원 지갑 흐름은 실행 직전 현재 멤버 권한과 승인을 검사하고 같은 호출을 한 번만 예약합니다. 조직 API·SDK·앱의 정책이며 기존 컨트랙트의 고정 수취인 증명 실행 권한은 변경하지 않습니다.

## 통합 CI

푸시·PR은 고정 Core 파이프라인에 현재 Front 커밋을 전달합니다. 타입·단위·정적 빌드·전체 데스크톱/모바일 브라우저, 재빌드한 Core 파일·소스와 SDK 일치, 고정 Contract의 실제 WASM/Groth16과 개발 릴리스를 검증합니다. CI는 새 로컬 서버를 사용하고 `CORE_E2E_PORT`로 테스트 포트를 지정할 수 있습니다. 비공개 저장소에는 읽기 전용 체크아웃 자격 증명과 Core 재사용 워크플로 접근 설정이 필요합니다. [버전·증거·설정](https://github.com/Company-privacy-settlement/Core/blob/main/docs/CI.md). 사이트 공개 범위·게시는 변경하지 않습니다.

## 정산 연결

1. 일치하는 Core 읽기 전용 API와 최종화 인덱스를 실행합니다. API와 독립적으로 받은 정책에서 네트워크·레지스트리·토큰·단위 금액·수수료 수취인·검증키/WASM 해시를 확인하고 Settlements에 정책 또는 승인 그룹 디렉터리를 가져옵니다.
2. 그룹별 API 주소를 넣고 검증된 용량을 확인합니다. 호스팅된 프론트에는 접근 가능한 HTTPS API와 정확한 프론트 origin의 CORS 허용이 필요합니다. 자금이 들어 있는 공개 테스트넷 그룹은 제공하지 않습니다.
3. 호환되는 NEAR 테스트넷 지갑을 연결하고 로컬 암호화 작업 저널을 생성·해제합니다. 저널이 열린 동안 그룹 변경은 잠깁니다.
4. Notes에서 FT 노트를 만들고 암호화 백업을 내려받은 뒤 다시 열어 공개 입금 플랜을 준비합니다. Settlements로 가져와 등록·스토리지·토큰 전송·가스 호출을 각각 검토합니다.
5. 서명된 결제창에서 결제 단위와 원래 그룹의 암호화 노트를 선택합니다. 신뢰한 증명 파일과 독립 매니페스트 해시를 가져와 로컬 증명을 생성합니다. 원금·별도 0.15% 출금 수수료·NEAR 비용을 확인한 뒤 선행 작업과 결제를 각각 승인하고 최종화 확인을 기다립니다. Local proofs와 CLI/공개 플랜 가져오기도 유지합니다.

그룹은 고정 금액과 **총 256개 출력**을 사용합니다. 입금·비공개 전송은 출력을 사용하고 출금해도 용량이 복구되지 않습니다. 가득 찼거나 중단된 그룹에서는 원래 그룹 복구만 가능합니다. 네이티브 NEAR v2는 Contract/Core CLI, 현재 브라우저 실행은 테스트넷 FT 그룹을 지원합니다.

## 결제·인보이스·증빙

입금과 출금에 원금의 **0.15%를 각각 추가**하며 토큰 최소 단위에서 내림합니다. 1 USDC 단위라면 입금 1.0015 USDC, 별도 출금 수수료 0.0015 USDC, 수취액 1 USDC입니다. NEAR 스토리지·계정 활성화·토큰 등록·가스는 별도입니다. [수수료 상세](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#fees).

신규 v2 인보이스는 결제 단위별 서명 참조를 사용하고 v1 읽기도 지원합니다. 결제 시 현재 판매자 FullAccess 키, 독립 정책, 수취인 준비, 증명 목적지와 인덱스의 부분/완료/지연/초과 결제를 확인합니다. 만료·단위 제한·참조 중복 검사는 앱 규칙이며 컨트랙트 예약이 아닙니다. 동시 결제로 초과 입금할 수 있고 지갑 승인·리다이렉트만으로 결제를 확정하지 않습니다.

서명 조건은 클라이언트 JSON 또는 링크 보유자가 볼 수 있는 URL fragment에 있습니다. 선택적 로컬 보관함은 판매자·네트워크별 암호화와 백업·복원·변경 불가 요청 병합을 지원합니다. 서버 인보이스함·웹훅·자동 환불·법정화폐 환전은 없습니다. 현재 호스팅은 소유자 비공개이며 결제 링크에도 같은 접근 제한이 적용됩니다.

증빙 영수증은 별도로 신뢰한 루트에 대한 선택 필드의 무결성을 확인하며 진실성·결제 최종성·신원·세무 인정을 보장하지 않습니다. Notes는 검증한 공개 루트만 입금 준비에 사용합니다. **임의 영수증 루트로 인보이스의 서명된 결제 단위 참조를 교체할 수 없습니다.** 인보이스와 업무 증빙의 결합에는 별도 커밋먼트 형식 설계가 필요합니다. [증빙 가이드](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_RECEIPTS.md).

## 데이터 소유와 복구

노트와 전체 영수증은 메모리·다운로드한 암호화 파일에 있으며 브라우저에 영구 저장하지 않습니다. 저널과 선택적 인보이스 보관함은 서로 분리한 암호화 브라우저 저장소를 사용합니다. 브라우저 데이터 삭제 전에 백업해야 하며 암호 복구는 없습니다. 저널은 노트 백업이 아닙니다.

비공개 작업 영역은 페이지 숨김·히스토리 캐시 복귀 때 잠기고 비공개 화면과 대기 작업을 취소합니다. 이미 열린 지갑 요청은 취소할 수 없습니다. 저장된 서명 의도는 원래 트랜잭션이나 바인딩된 최종 상태를 명시적으로 대조할 때까지 재전송을 막으며 자동 재전송하지 않습니다. 탭 간 배타 제어로 갱신을 보호합니다.

## 기업 검증과 한계

KYB는 미국·아부다비 본토·ADGM의 샘플 입력입니다. 초안은 메모리에만 있고 새로고침·KYB 화면 이탈 시 삭제됩니다. 파일 내용은 읽거나 업로드하지 않습니다. 준비 결과는 `verified: false`, `credentialIssued: false`, `providerSubmission: not_sent`입니다. 실제 제공자 심사·결제 자격 발급은 없습니다. 미국 주/연방·ADGM/본토 세무·법무 준비, 결정적 규칙 계산과 AI 초안은 향후 연동입니다.

원금은 개별 볼트에 보관하고 공유 노트로 자금이 있는 한 볼트에서 직접 지급합니다. 여러 볼트를 순차 경유하지 않습니다. 공개 서명자·수취인·금액·시간·볼트·참조로 연관 분석할 수 있으며 볼트 수만으로 익명성을 보장하지 않습니다. 프로토콜과 단일 머신 개발 셋업은 프로덕션 감사를 받지 않았습니다. [프라이버시](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md) · [서비스 한계](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#current-boundaries).

## 저장소

- [Core](https://github.com/Company-privacy-settlement/Core): 브라우저/Node SDK, 증명 CLI, 읽기 전용 API, 인덱스·증빙.
- [Contract](https://github.com/Company-privacy-settlement/Contract): 컨트랙트, 회로, 벡터·WASM 빌드.
- [Front](https://github.com/Company-privacy-settlement/Front): 랜딩, Docs·지갑 화면.

외부 분석·원격 폰트 요청은 없습니다. 지갑 연결 시 NEAR Connect 매니페스트·제공자 인터페이스를 불러옵니다.

**2026-11-14 결제 대시보드 검증:** 신규 Core 13개·브라우저 18개를 포함한 **Core 355개 테스트**, **데스크톱·모바일 브라우저 182개 케이스**와 타입·Node/브라우저 SDK·정적 빌드를 통과했습니다. 브라우저의 서비스·지갑 픽스처 검증은 공개망 실배포를 의미하지 않습니다.

**2026-11-14 결제 웹훅 검증:** 신규 Core 24개·브라우저 12개를 포함한 **Core 379개 테스트**, **데스크톱·모바일 브라우저 194개 케이스**와 Node/브라우저 SDK·정적 빌드·컴파일된 서비스 복구 검증을 통과했습니다. 로컬 인덱스·지갑·전송 픽스처 검증이며 실제 수신처 전송·공개 백엔드 배포는 수행하지 않았습니다.

근로자·계약자 일괄 송금 검증(**2026-11-14**): **Core 401개 테스트**, **데스크톱·모바일 브라우저 210개 케이스** 통과(신규 Core 22개·브라우저 16개 포함). 타입 검사, Node/브라우저 SDK·정적 Front 빌드, 컴파일 서버 재시작·백업·복구와 문서 검증을 통과했습니다. 지갑·RPC·조직 서비스는 로컬 테스트 환경이며 실제 자금이 있는 공개 네트워크 급여 송금이나 실제 모바일 지갑을 검증한 결과는 아닙니다.

Organization → Verification에 [Sumsub KYB/KYC 연동](https://github.com/Company-privacy-settlement/Core/blob/main/docs/VERIFICATION.md)을 추가했습니다. 기업·실소유자 심사, 보완 제출, 최소 상태 암호화, 인증 웹훅과 심사 완료일 기준 만료·철회를 처리합니다. 계약 계정·심사 레벨·HTTPS 콜백 설정이 필요하며 실제 기업 심사는 아직 검증하지 않았습니다. 별도 `/kyb/` 샘플은 전송하지 않습니다.

KYB/KYC 연동 검증(**2026-11-14**): 신규 Core 27개·브라우저 14개를 포함한 **Core 428개 테스트**, **데스크톱·모바일 브라우저 224개 케이스**를 통과했습니다. 타입·Node/브라우저 SDK·정적 Front 빌드, 컴파일 서버 재시작·백업·복구, 문서와 SDK 동기화 검증도 통과했습니다. 제공자·RPC·지갑은 로컬 테스트 환경이며 실제 Sumsub 계정·기업/개인 심사·라이브 콜백·공개 백엔드는 검증하지 않았습니다.

[미국·아부다비 규칙 엔진](https://github.com/Company-privacy-settlement/Core/blob/main/docs/RULES.md)은 관할·근로자/계약자/B2B 형태·적용일에 따라 7개 출처 확인 후보를 선택하고 정확한 계산식과 공식 출처를 남깁니다. 브라우저·CLI 로컬 실행과 독립적으로 신뢰한 Ed25519 검토 서명을 지원합니다. 전문 검토 승인·전체 세액·자동 원천징수·신고는 포함하지 않습니다.

규칙 엔진 검증(**2026-11-14**): 신규 Core 31개·Rules 브라우저 16개를 포함한 **Core 459개 테스트**, **데스크톱·모바일 브라우저 240개 케이스**를 통과했습니다. 타입·Node/브라우저 SDK·정적 Front 빌드, 컴파일 CLI 내보내기/재검증, 서버 재시작·백업·복구와 출처/문서 검사도 통과했습니다. 검토 키는 테스트용이며 전문 세무·법무 규칙 승인, 실제 납세자 평가·자동 원천징수·신고는 수행하지 않았습니다.
