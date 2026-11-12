# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

새 인보이스 v2는 Payment unit 선택기로 결제 단위별 별도 서명 참조를 사용하며 기존 v1은 공통 참조로 열립니다. 단위별 action을 내려받아 로컬에서 증명을 생성합니다. 새 결제 승인 전 인덱싱된 참조 재사용을 검사하지만 동시 결제·인덱스 지연에 따른 재사용은 가능하며 실제 지급액은 모두 집계합니다. 업데이트된 Core API와 함께 사용하세요. 분산 보관은 공유 노트와 한 지급 볼트를 뜻하며 원금의 연속 경유가 아닙니다. 수취 주소·금액·시간·서명자는 공개되고 링크 보유자와 API는 참조를 연결할 수 있습니다. [프라이버시 구조](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md)를 참고하세요.

조회 중·조회 실패·신뢰 배포 설정 변경 시 인보이스 상태를 비우고 무효화된 요청의 늦은 응답을 무시합니다. 새 조회 성공 후 결제 계획을 가져올 수 있으며 원래 목적지로의 복구는 유지합니다. 업데이트된 Core 인덱서는 서명된 참조 집합을 직접 조회합니다. [리뷰·회귀 검증](https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-12.md)을 참고하세요.

NEAR 기반 기업 간 정산·근로자 지급 프로토콜을 소개하는 Next.js 랜딩과 해커톤 데모입니다. 컨트랙트와 서버/SDK는 별도 저장소로 유지합니다.

- `/`: 프로토콜 랜딩, 분산 vault·공유 익명성·선택적 공개·수수료 설명
- `/app/`: 데모 대시보드, 입금/송금, vault 유동성, 거래 검색/내보내기
- `/app/?view=proofs`: 기록된 Groth16 증명 실제 브라우저 검증, 선택적 공개 영수증

## 디자인 기준

랜딩과 앱은 [NEAR 공식 홈페이지](https://www.near.org/)를 참고한 검정·흰색·선명한 그린, 보통 굵기의 타이포그래피와 얇은 테두리를 공유합니다. 인보이스 편집·결제·정산의 기존 작업 구조를 유지하며 랜딩과 앱의 제목 위 장식 문구를 제거했습니다. `src/app/near-theme.css`, `src/app/merchant-theme.css`, `src/app/workspace-layout.css`가 공통 색상과 작업 영역을 구성하고 KYB 스타일은 `src/app/kyb/kyb.css`에 있습니다. DM Sans는 자체 호스팅하고 `public/core-field.svg`는 자체 그래픽입니다. Core의 독립 브랜드와 프로토콜을 유지합니다.

앱은 동적 화면 높이에 맞춰 내비게이션과 푸터를 고정하고 본문 안에서 스크롤합니다. 결제 화면도 하나의 세로 스크롤 영역을 사용합니다. 페이지 이동 시 본문을 처음 위치로 돌리고 스크롤이 바깥 페이지로 이어지지 않게 합니다. 작은 화면에서도 긴 폼·표·검토 상세에 접근할 수 있습니다.

인보이스 편집기는 실제 초안의 제목·수취인·고정 노트 수·토큰 원금·추가 수수료를 미리 보여줍니다. 정책에 토큰 표시 소수점 정보가 없으므로 금액은 최소 단위로 표시합니다. 초안은 저장하지 않습니다. 결제는 서명된 청구 내역과 송금자 절차를 분리하며 정산 연결 상태는 검증한 정책·지갑·로컬 저널에서 가져옵니다.

## 기업 확인 / KYB

`/kyb/`는 진행 현황 → 기업 정보 → 대표자·소유 구조 → 증빙 서류 → 최종 확인 → 검토 상태의 6개 별도 페이지로 구성한 데모 접수 과정입니다. 미국·아부다비 본토·ADGM을 구분합니다. KYB 내부 페이지 이동 중에는 초안을 메모리에 유지하며 새로고침하거나 작업 공간을 벗어나면 지웁니다. 예시 정보만 사용하세요. localStorage·sessionStorage·서버·외부 제공자에는 전송하거나 저장하지 않습니다.

서류 단계는 파일당 10 MB 이하의 PDF/PNG/JPEG 예시 파일 메타데이터만 선택하며 파일 본문을 읽거나 업로드하지 않습니다. 데모 체크리스트는 필수 증빙 4개와 선택 자금 출처 자료로 구성하며 관할별 법정 요건을 확정하지 않습니다. 실제 신원 확인·스크리닝·심사 제공자는 미연동입니다.

기업·소유 구조·증빙을 완료하고 권한 확인에 동의해야 요청을 준비할 수 있습니다. 정보 변경은 준비 상태와 동의를 무효화하고 관할 변경은 등록·기관·위치·증빙 기록도 비웁니다. 내보내는 예시 JSON에는 `verified: false`, `credentialIssued: false`, `providerSubmission: "not_sent"`를 명시합니다. 상태 페이지는 KYB 자격증명을 발급하거나 송금 자격을 변경하지 않습니다. 공식 자료는 제공자의 판단을 위한 참고 링크입니다.

## 실행

Node.js 22 이상이 필요합니다.

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 실행합니다. `npm run build`는 Next.js 정적 export를 `out/`에 생성하므로 정적 호스팅에도 배포할 수 있습니다. API 키나 환경변수는 필요하지 않습니다.

```sh
npm run check
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

브라우저 테스트는 빌드된 `out/`를 임시 서버로 제공해 데스크톱·모바일에서 실행합니다. 포트 3000을 사용합니다.

## 수취인 발행 인보이스

`/invoices/`에서 판매자 NEP-413 서명 청구서를 만들고 `/pay/#invoice=...`에서 결제합니다. 신뢰한 테스트넷 FT 정책, 메시지 서명 지원 지갑, 수신 계정·제목·참조, 고정 결제 단위 1–32개와 만료 시점을 설정합니다. 서명 JSON을 저장하고 링크를 공유하며 저장 파일을 다시 열어 조회합니다. API는 청구 내용을 저장하지 않습니다.

결제 화면은 서명·현재 판매자 full-access 키와 독립적으로 신뢰한 그룹 정책을 확인합니다. 청구 해시·수취인에 묶인 출금 증명만 가져오며 비밀 노트·증명은 Core CLI에서 만듭니다. 지갑 호출을 한 단계씩 승인하고 확정 인덱스 기록으로 일부·완료·지연·과입금을 판단합니다. 리다이렉트는 결제 완료 증거가 아닙니다. 출금 0.15%와 별도로 NEAR 저장·가스 및 필요 시 노트 입금 수수료가 있습니다.

환전, 중앙 보관 판매자 잔고, 콜백, 자동 환불은 제공하지 않습니다. 기한·청구 한도는 앱 규칙이므로 동시 결제·지연 TX는 과입금·지연 지급될 수 있습니다. 링크 보유자는 청구 내용을 볼 수 있으며 JSON은 암호화 백업이 아닙니다. 공유 링크에도 사이트 접근 권한이 적용됩니다. [Core 인보이스 구조](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICES.md)를 참고하세요.

## 테스트넷 지갑 워크스페이스

`/live/`는 **사용자가 설정한 테스트넷 FT 공유 그룹**에서 실제 지갑으로 검토한 호출을 실행합니다. 자금이 준비된 공개 배포를 포함하지 않습니다. NEAR Connect 0.12.0을 사용하며 비밀키는 선택한 지갑이 보관합니다. 토큰 등록, NEAR 스토리지 충전, 토큰 송금과 원래 목적지에 묶인 복구를 각각 검토·서명합니다.

1. 실제 `CORE_POLICY_FILE`, `CORE_RPC_URL`, 정확한 프론트 origin을 `CORE_ALLOWED_ORIGINS`로 설정해 Core 읽기 전용 API를 실행합니다. 호스팅한 Front에서는 HTTPS API를 사용합니다.
2. API 주소와 API 외부에서 독립적으로 받은 신뢰 정책 파일을 입력해 모든 고정 값을 대조합니다.
3. 테스트넷 지갑을 연결하고 12자 이상 암호로 로컬 암호화 기록을 생성·해제합니다.
4. Core CLI의 `shared-deposit-args` 또는 `shared-spend-args`가 만든 **공개 FT 계획 JSON**을 가져옵니다. 비밀 노트와 증명 생성은 로컬 CLI를 사용합니다. 작업 기록은 비밀 노트의 백업이 아닙니다.
5. 목적지, 토큰 최소 단위 금액, 첨부 NEAR와 추가 가스를 확인하고 한 단계씩 서명합니다. 확정 상태가 입금 `Active` 또는 출금 `Complete`가 될 때까지 새로 확인합니다.
6. 암호화 기록을 내보냅니다. 지갑 응답이 유실되면 재서명을 막고 원래 TX 해시나 해당 온체인 기록을 확인합니다. 자동 재송금·암호 복구 기능은 없습니다.

기록은 PBKDF2-SHA256과 AES-256-GCM으로 암호화하며 Web Locks로 다른 탭의 동시 서명을 막습니다. 해제한 공개 작업 정보는 페이지 메모리에 있으며 Lock 시 클라이언트 암호를 지웁니다. 잠금 API 미지원 시 서명을 진행하지 않습니다. 백업 복원은 기존 기록을 덮어쓰지 않도록 빈 저장소에서만 가능합니다. 설정한 API는 공개 준비·상태 요청을 볼 수 있습니다.

`src/vendor/core-client/`의 Core 번들과 타입·SHA-256 명세를 포함하고 빌드 시 해시를 확인하므로 형제 저장소 없이 빌드됩니다. 갱신은 Core에서 `npm run build:client`, Front에서 `npm run sync:core`로 합니다. [Core 지갑 연동 안내](https://github.com/Company-privacy-settlement/Core/blob/main/docs/WALLET.md)를 참고하세요.

브라우저 테스트는 표준 주입형 테스트 지갑과 모의 공개 조회를 사용합니다. 실제 WASM·증명·서명 어댑터 실행은 Core 샌드박스에서 검증합니다. 공개 테스트넷 배포에 자금이 있는 외부 지갑을 연결하는 검증은 남아 있습니다.

그룹 정책을 대조한 뒤 `/live/`에서 공개 정산 내역도 조회합니다. 출처 연결/미확인, 외부 TX 성공·실패, 수집 시점, 자동 탐색 범위·대기 상태, 이벤트·수신자 필터와 고정 페이지를 표시합니다. 공개 조회에는 지갑이나 작업 기록 잠금 해제가 필요 없습니다. 정책·토큰·원금·수수료를 검증하고 인덱서가 꺼졌거나 실패하면 데모로 대체하지 않고 상태를 알립니다. Core `CORE_INDEX_DB`와 선택적인 `CORE_DISCOVERY_START_HEIGHT`를 설정합니다. 새로고침은 DB 조회이며 현재 체인이나 전체 기업 이력·세금 신고를 증명하지 않습니다.

## 데모 범위

`/app/`의 입출금은 **브라우저 안에서 실행하는 시뮬레이션**이며 잔액·기업·인물은 예시 데이터입니다. 실제 지갑 호출은 별도 설정이 필요한 `/live/`에서 검토·서명합니다. EOA 키 생성과 브라우저 동적 증명 생성은 두 화면 모두 제공하지 않습니다.

데모 지갑 20 NEAR, 비공개 노트 3개, vault 세 곳의 총 유동성 12 NEAR로 시작합니다. 고정 단위 1 NEAR 노트의 입금은 노트/유동성을 늘리고, 지급은 노트/선택한 vault 유동성을 줄입니다. 입금만 트리의 새 leaf를 차지합니다. 상태는 localStorage에 저장되며 Reset demo로 초기화합니다. 실제 키·실제 기업 개인정보를 입력하지 않는 예시 UI입니다.

1 NEAR 기준 수수료는 금액에 **더해서** 부과합니다.

| 작업 | 데모 지갑 차감 | 노트/수신자 원금 |
| --- | --- | --- |
| 입금 | 1 + 0.0015 protocol fee + 0.02 storage = **1.0215 NEAR** | 노트 **1 NEAR** |
| 지급/출금 | 0.0015 protocol fee + 0.02 storage = **0.0215 NEAR** | 비공개 잔고에서 **1 NEAR**, 수신자 **1 NEAR** |

네트워크 gas는 실거래에서 별도입니다. 데모는 gas를 청구하지 않습니다. 저장소 비용과 프로토콜 수수료를 구분해 보여줍니다.

## 실제로 검증하는 것

- **Groth16**: `public/data/proof-vector.json`은 Contract의 cross-vault A→B 테스트 벡터와 Core의 verifying key를 사용합니다. Arkworks little-endian proof를 snarkjs 형식으로 변환해 BN254 pairing 검증을 수행합니다. 입력 노트를 식별하지 않고 root/domain/nullifier 등의 공개 입력에 대한 수학적 증명을 검증합니다. 이는 **기록된 테스트 증명**이며 UI의 모의 송금에 대한 증명이 아닙니다. 개발 trusted setup을 사용합니다.
- **영수증 무결성**: Web Crypto SHA-256으로 8개 필드의 salted Merkle commitment를 만들고, 선택한 필드의 opening만 검증/JSON 내보내기 합니다. 형식은 Core SDK의 disclosure 모듈과 같습니다. 로컬 commitment와 값의 일치만 증명하며, 온체인 결제·기업 신원·세금 적법성을 인증하지 않습니다. 영수증을 열 때 새 샘플 commitment를 생성합니다.

미국/아부다비 예시 지급 흐름을 제공합니다. 실제 KYB/KYC 공급자와 AI 세금/법적 절차 준비는 후속 통합 범위입니다. 코드와 UI는 프로덕션 보안 감사를 받지 않은 해커톤 개발물입니다.

## 구조

```text
src/app/page.tsx              랜딩
src/app/app/page.tsx          데모 진입
src/components/dashboard.tsx 대시보드와 지급/영수증 흐름
src/lib/demo.ts               BigInt 수수료와 로컬 상태 전이
src/lib/receipts.ts           선택적 공개 commitment
src/lib/proof.ts              기록된 Groth16 증명 검증
public/data                  공개 테스트 벡터
public/vendor                자체 호스팅 검증기와 라이선스
```

- [Contract](https://github.com/Company-privacy-settlement/Contract): NEAR Rust 컨트랙트, 회로, 테스트 벡터
- [Core](https://github.com/Company-privacy-settlement/Core): 서버/SDK, 기업 자격·증빙 데이터 모델, 체인 통합 검증
- [Front](https://github.com/Company-privacy-settlement/Front): 이 Next.js 프론트

Front의 실행·빌드는 로컬 형제 저장소 폴더에 의존하지 않습니다. 프론트에는 비밀키나 proving key를 포함하지 않습니다. 외부 분석/트래킹과 원격 폰트 요청은 없습니다. 지갑 연결 시 NEAR Connect의 공개 지갑 명세와 공급자 화면을 요청합니다.
