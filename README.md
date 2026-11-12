# Core Front

[한국어](README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md)

NEAR 기반 기업 간 정산·근로자 지급 프로토콜을 소개하는 Next.js 랜딩과 해커톤 데모입니다. 컨트랙트와 서버/SDK는 별도 저장소로 유지합니다.

- `/`: 프로토콜 랜딩, 분산 vault·공유 익명성·선택적 공개·수수료 설명
- `/app/`: 데모 대시보드, 입금/송금, vault 유동성, 거래 검색/내보내기
- `/app/?view=proofs`: 기록된 Groth16 증명 실제 브라우저 검증, 선택적 공개 영수증

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

## 데모 범위

입출금은 **브라우저 안에서만 실행하는 시뮬레이션**입니다. 지갑 연결, EOA 생성/개인키 보관, 실시간 온체인 조회, 트랜잭션 서명/브로드캐스트, 동적 지급 증명 생성은 연결하지 않았습니다. 테스트넷에 배포된 컨트랙트가 있는 것처럼 표시하지 않습니다. 예시 기업·인물은 데모 데이터입니다.

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

미국/아부다비 예시 지급 흐름을 제공합니다. 실제 KYB/KYC 공급자, AI 세금/법적 절차 준비, 지갑 서명과 테스트넷 연결은 후속 통합 범위입니다. 코드와 UI는 프로덕션 보안 감사를 받지 않은 해커톤 개발물입니다.

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

Front의 실행·빌드는 로컬 형제 저장소 폴더에 의존하지 않습니다. 프론트에는 비밀키나 proving key를 포함하지 않습니다. 외부 분석/트래킹과 원격 폰트 요청도 없습니다.
