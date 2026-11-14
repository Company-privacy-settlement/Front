# Money Station — private business payments

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

Money Station is a private business payment service built on NEAR. The English-first landing, application and Docs use a shared black-and-green design. The wallet connects to the configured test network while repeated network badges are omitted from product chrome. [Service configuration and release gates](docs/MONEY_STATION_DEPLOYMENT.md).

Ubuntu hosting for `moneystation.site`: [isolated service, release verification and pre-DNS routing](docs/UBUNTU_HOSTING.md). The frontend systemd service and actual HTTP domain route are deployed; settlement/indexer and Organization APIs are ready on loopback. Restart, isolation and route checks passed. Public HTTPS awaits working DNS.

Money Station frontend validation: **12 unit tests** and the full **280 desktop/mobile browser tests** passed. The English demo below uses Money Station’s black-and-green visual system, with labelled wallet/API fixtures and local proof generation.

Private business settlement on NEAR: independent vaults hold principal, shared zero-knowledge notes authorize payouts, and selective evidence supports reconciliation.

Front is the Next.js landing, documentation and application repository.

Optional delayed delivery is available at `/relay/`: persistently sampled execution windows, batches of up to eight separate transactions, waiting/cancellation/expiry and original-request recovery. [Scheduling guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SCHEDULED_DELIVERY.md). This does not establish anonymity or a live hosted relay.

Scheduled-delivery validation: **565 Core tests**, **8 Front unit tests**, real native/FT WASM and Groth16 scheduling checks, and desktop/mobile delivery/recovery/proof UX regressions. Public USDC and a hosted HTTPS relay remain separately unqualified.

An opt-in [cover-traffic experiment](https://github.com/Company-privacy-settlement/Core/blob/main/docs/COVER_TRAFFIC.md) now runs bounded operator-owned native notes on testnet. Four transactions finalized; the 0.1 NEAR principal returned to its operator. The synthetic probe had six historical output candidates, three after excluding labelled artificial outputs. Independent participants added: **0**. Budget/frequency limits persist across restart; this is not an anonymity claim.

[Payment security review](https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-14-PAYMENT-SECURITY.md): fixed same-note reservation aliases across policy metadata, including legacy conflicts. Validation covers double spends, competing liquidity, failure accounting, immutable approval and revocation: **582 Core tests** and **63 contract tests**. Corporate approval remains an API/SDK control; public valid-proof execution is permissionless.

[Actual-provider qualification](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PROVIDER_QUALIFICATION.md) now has read-only Sumsub state checks and source/signed-review gates. Four of six official source hashes matched in the dated run. Live credentials, authorized cases and external signed reviews were absent, so actual KYB/tax-provider acceptance remains **blocked**. Deactivation and beneficiary-structure event handling were corrected.

## The idea

Businesses need to pay suppliers, employees and contractors without putting invoice terms and business records on-chain. Money Station combines signed payment requests, local proofs and reviewable evidence while keeping custody distributed across vaults.

[Hackathon guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/HACKATHON.md) · [Web Docs](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/) · [Core](https://github.com/Company-privacy-settlement/Core) · [Contract](https://github.com/Company-privacy-settlement/Contract) · [Front](https://github.com/Company-privacy-settlement/Front)

## Watch the demo

[![Money Station — English narrated hackathon demo](docs/assets/hackathon-demo-poster.png)](https://github.com/Company-privacy-settlement/Front/blob/main/public/media/money-station-demo-en.mp4)

[Watch English MP4](https://github.com/Company-privacy-settlement/Front/blob/main/public/media/money-station-demo-en.mp4) · [Captions, transcript & chapters](https://github.com/Company-privacy-settlement/Front/blob/main/docs/HACKATHON_DEMO.md) · [Hosted video player](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/media/)

English narration, short captions, motion graphics and actual Money Station screens. Browser segments use labelled wallet/API fixtures and real local proof generation. Native NEAR public-testnet evidence is documented separately below.

Repository and Site access follow their existing permissions. Demo media is stored in Front; reviewers need Front access, or the downloadable video bundle. No sharing permissions are changed by this submission.

## What is built

| Capability | Implementation |
| --- | --- |
| Invoices → checkout | Signed request → encrypted note → local proof → amount/fee review → wallet calls → confirmation. |
| Private workspaces | Notes, proof verification/cancellation, selected evidence and encrypted local journals. |
| Organization | Members/roles, invoice dashboard, payment approval, payouts, webhooks and verification workflows. |
| Tax drafts | Source-bound outlines, optional configured AI planning, immutable revisions and independent review. |
| Documentation | English-first landing and eleven web guides; English/Korean/Simplified Chinese READMEs. |

## Run locally

Node.js 22.16+. The app builds without sibling checkouts or API keys. The static export is `out/`. Browser settlement needs an independently trusted FT policy plus separately configured Core/Organization APIs; the native evidence policy is not a USDC browser policy.

```bash
npm ci
npm run dev
# Production export and checks
npm run check
npm test
npm run build
```

Routes: `/docs/`, `/invoices/`, `/pay/`, `/notes/`, `/prove/`, `/evidence/`, `/organization/`, `/rules/`, `/kyb/`, `/live/`. Demo media is under `public/media/`; fixture recording tools are under `scripts/demo/` and are excluded from the application runtime.

## Real testnet evidence

**14 actual public-testnet transactions reached FINAL** on 2026-11-14: deploy/seal, two 0.1 NEAR deposits, payouts and an actual missing-recipient failure recovered to the original destination. Both recipients received the full 0.1 NEAR; retry charged no second protocol fee. Registry and both vaults were keyless. A separate read-only verifier checked receipts, signatures, historical before/after balances and 0.0006 NEAR collected protocol fees.

[Testnet run and transaction links](https://github.com/Company-privacy-settlement/Core/blob/main/docs/TESTNET_WALLET.md) · [Public evidence](https://github.com/Company-privacy-settlement/Core/blob/main/docs/evidence/testnet-wallet-2026-11-14.json)

[Contract and vault addresses](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/deployments/) · [Address record and verification pins](https://github.com/Company-privacy-settlement/Core/blob/main/docs/DEPLOYED_ADDRESSES.md). Registry and two vaults were rechecked at FINAL block **277653473** on 2026-11-14. This native NEAR testnet reference is separate from browser USDC settlement.

Latest recorded engineering gate: **595 Core tests** passed, with SDK/type builds and compiled service restart/backup/recovery. Browser fixtures and public native execution are separate evidence categories.

## Architecture and fees

```mermaid
flowchart LR
    P["Payer"] --> A["Independent vault A"]
    P --> B["Independent vault B"]
    A -. "shared commitments / nullifiers" .-> Z["NEAR ZK registry"]
    B -. "shared commitments / nullifiers" .-> Z
    Z -. "authorize one funded payout" .-> B
    B --> R["Recipient: full principal"]
```

Deposit and withdrawal each add **0.15%**. The recipient receives the full principal. NEAR action storage, registration, activation and network gas are separate.

The ZK statement hides which input note is spent. Signers, recipients, timing, fixed amounts, vaults and funding edges remain public. This single-payer run does not establish effective anonymity. A separate opt-in testnet tool labels operator cover activity; a group currently supports 256 total outputs.

## Scope and next steps

**Hackathon / development prototype.** The setup is `UNSAFE_LOCAL_DEVELOPMENT_ONLY`. Public-testnet qualification covers native NEAR with a local Ed25519 software wallet. Real browser-wallet/USDC execution, hosted API HTTPS acceptance, observed remote Actions success and production security review remain open.

Next priorities: externally hosted relay qualification, independent participation and stronger adversarial privacy measurements. Live KYB/AI providers, professional rule approval and statutory filing require separate qualification.

## Explore the project

[Service](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md) · [Privacy](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md) · [Invoices](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICE_PAYMENTS.md) · [Organizations](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATIONS.md) · [Tax drafts](https://github.com/Company-privacy-settlement/Core/blob/main/docs/TAX_DRAFTS.md) · [Deployment](https://github.com/Company-privacy-settlement/Core/blob/main/docs/DEPLOYMENT.md) · [Hosting](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRODUCTION_HOSTING.md) · [CI](https://github.com/Company-privacy-settlement/Core/blob/main/docs/CI.md) · [Roadmap](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)
