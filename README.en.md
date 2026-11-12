# Core Front

[한국어](README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md)

A Next.js landing page and hackathon demo for private B2B settlement and employee payments on NEAR. Contracts and server/SDK code are maintained in separate repositories.

- `/`: protocol landing page explaining distributed vaults, shared anonymity, selective disclosure, and fees.
- `/app/`: demo dashboard, deposits/payments, vault liquidity, activity search, and exports.
- `/app/?view=proofs`: real in-browser verification of a recorded Groth16 proof and selectively disclosed receipts.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm run build` creates a Next.js static export in `out/`, suitable for static hosting. No API keys or environment variables are required.

```sh
npm run check
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

Browser tests serve the built `out/` directory with a temporary server on port 3000 and run on desktop and mobile viewports.

## Demo scope

Deposits and withdrawals are **simulated entirely in the browser**. Wallet connections, EOA generation/private-key storage, live on-chain queries, transaction signing/broadcasting, and dynamic payout proof generation are not connected. The UI does not present contracts as deployed on testnet. Example companies and people are demo data.

The workspace starts with a 20 NEAR demo wallet, three private notes, and 12 NEAR of total liquidity across three vaults. Depositing a fixed 1 NEAR note increases notes and liquidity; a payment decreases notes and the selected vault's liquidity. Only deposits occupy new tree leaves. State is stored in localStorage and cleared with Reset demo. The sample UI does not request real keys or real enterprise personal data.

For a 1 NEAR principal, fees are charged **on top of the amount**.

| Operation | Demo wallet charge | Note/recipient principal |
| --- | --- | --- |
| Deposit | 1 + 0.0015 protocol fee + 0.02 storage = **1.0215 NEAR** | **1 NEAR** note |
| Payment/withdrawal | 0.0015 protocol fee + 0.02 storage = **0.0215 NEAR** | **1 NEAR** from private balance; recipient receives **1 NEAR** |

Network gas is additional for real transactions. The demo charges no gas and shows storage costs separately from protocol fees.

## What is actually verified

- **Groth16**: `public/data/proof-vector.json` uses Contract's cross-vault A→B test vector and Core's verifying key. It converts Arkworks little-endian proof encoding to snarkjs format and performs BN254 pairing verification. This verifies the mathematical proof against public inputs such as the root, domain, and nullifier without identifying the input note. It is a **recorded test proof**, not a proof of a simulated UI payment. It uses a development trusted setup.
- **Receipt integrity**: Web Crypto SHA-256 creates a salted Merkle commitment over eight fields. Only selected field openings are verified and exported as JSON. The format matches Core SDK's disclosure module. It proves that values match the local commitment; it does not certify on-chain payment, enterprise identity, or tax compliance. Opening a receipt creates a new sample commitment.

The demo includes sample US/Abu Dhabi payment flows. Real KYB/KYC providers, AI tax/legal preparation, wallet signing, and testnet connections are future integrations. The code and UI are hackathon development work without a production security audit.

## Structure

```text
src/app/page.tsx              Landing page
src/app/app/page.tsx          Demo entry
src/components/dashboard.tsx Dashboard and payment/receipt flows
src/lib/demo.ts               BigInt fees and local state transitions
src/lib/receipts.ts           Selective disclosure commitments
src/lib/proof.ts              Recorded Groth16 proof verification
public/data                  Public test vectors
public/vendor                Self-hosted verifier and license
```

- [Contract](https://github.com/Company-privacy-settlement/Contract): NEAR Rust contracts, circuits, and test vectors.
- [Core](https://github.com/Company-privacy-settlement/Core): server/SDK integration code, enterprise credential/evidence data models, and chain integration validation.
- [Front](https://github.com/Company-privacy-settlement/Front): this Next.js frontend.

Running and building Front does not require sibling repository directories. The frontend contains no private keys or proving keys. It makes no external analytics/tracking or remote font requests.
