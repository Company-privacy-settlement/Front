# Core Front — business payments on NEAR

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

English-first landing, documentation and wallet tools for Core, a development protocol for private business-to-business and business-to-worker settlement. Built with Next.js; contracts, proving and server/index code remain in separate repositories.

[Service overview](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md) · [Web Docs](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/) · [Development roadmap](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)

## Workspaces

| Route | Current behavior |
| --- | --- |
| `/` | Service landing and documentation entry |
| `/docs/` | Nine English guides: setup, architecture, fees, invoices, groups, privacy, KYB, SDK/API and recovery |
| `/live/` | Independently configured testnet FT settlements, reviewed wallet calls, encrypted journal and public indexed activity |
| `/notes/` | Local FT note creation, encrypted backup/reopen, optional disclosure-root import and public deposit-plan preparation |
| `/invoices/` | Recipient-signed NEP-413 requests with per-unit references; optional encrypted local invoice library |
| `/pay/#invoice=…` | Signed checkout, recipient readiness, exact withdrawal-plan binding and finalized invoice reconciliation |
| `/evidence/` | Private receipts, encrypted backups, selected-field proofs and integrity checks against an independently supplied root |
| `/kyb/` | Six-page sample intake: overview, business, people/ownership, documents, review and status |
| `/app/` | Legacy routes redirect to the relevant Docs guide |

The site and web Docs default to English. READMEs also support Korean and Simplified Chinese. Landing, Docs and app share black, white and green styling, contained mobile layouts and independently scrolling content. `src/lib/docs.ts` is the web-guide source.

## Run and validate

Requires Node.js 22 or later.

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

The static export is `out/`. Build verifies the vendored Core browser bundle/declarations against their SHA-256 manifest and requires no sibling checkout or API keys. After changing Core: run `npm run build:client` in Core, then `npm run sync:core` here. Tests cover Docs, mobile containment, invoices, recipient readiness, evidence, notes, wallet recovery, journals and sample KYB. The latest recorded full browser run on 2026-11-13 passed 98 cases; see Core’s [roadmap](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md) for validation scope.

## Configure a settlement

1. Run the matching Core read-only API and finalized index. Obtain the trusted deployment policy independently of the API; check network, registry, token, denomination, treasury and verifier/WASM hashes. Import that policy or an approved group directory in Settlements.
2. Enter each group’s API origin and inspect verified capacity. A hosted frontend requires a reachable HTTPS API whose CORS allowlist includes the exact frontend origin. No funded public testnet group is bundled.
3. Connect a compatible NEAR testnet wallet. Create/unlock the local encrypted operation journal; group selection locks while the journal is open.
4. Create an FT note in Notes, download its encrypted backup and reopen it before preparing a public deposit plan. Import the plan in Settlements and review each registration, storage, transfer and gas approval.
5. Generate a new Groth16 spend proof with the Core CLI using the note’s original group. Browser proving is not implemented. Import the public withdrawal plan, verify its exact recipient/reference and reconcile finalized state before considering payment complete.

Groups use fixed denominations and **256 total outputs**. Deposits and private transfers consume outputs; withdrawing does not restore capacity. Full or retired groups allow original-group recovery, not new deposits. Native NEAR v2 is available through Contract/Core CLI; browser execution currently supports testnet FT groups.

## Payments, invoices and evidence

Deposit and withdrawal each add **0.15%** of principal, rounded down in token atomic units. For a 1 USDC denomination: deposit 1.0015 USDC, pay a separate 0.0015 USDC withdrawal fee, and deliver the full 1 USDC. NEAR storage, account activation, token registration and gas are separate. [Fee details](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#fees).

New invoice terms v2 use a distinct signed reference per payment unit; v1 remains readable. Checkout checks current merchant FullAccess ownership, independent policy, recipient readiness, exact proof destination and indexed partial/paid/late/overpaid totals. Expiry, unit caps and reference reuse are application checks, not contract reservations. Concurrent payments can overpay. A wallet approval or redirect does not prove payment.

Signed terms remain client-held in JSON or a URL fragment visible to link holders. The optional invoice library encrypts local merchant/network namespaces and supports backup, restore and immutable-request merge. There is no server terms inbox, webhook, automatic refund or fiat conversion. Hosted access remains owner-private, including shared checkout links.

Evidence receipts prove selected-field integrity against a separately trusted root; they do not establish truthful declarations, payment finality, identity or tax acceptance. Notes import only a verified disclosure root for public deposit planning. **An arbitrary receipt root cannot replace an invoice’s signed per-unit payment reference.** Combined invoice/business evidence needs a separately designed commitment format. [Evidence guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_RECEIPTS.md).

## Data ownership and recovery

Notes and full receipts remain in memory and downloaded encrypted files, not persistent browser storage. Journals and the optional invoice library use separate encrypted browser stores. Export backups before clearing browser data; there is no passphrase recovery. A journal is not a note backup.

Private workspaces lock on page-hide and history-cache return, clearing private views and cancelling pending work. An already-open wallet request cannot be undone. A saved signing intent blocks resubmission until explicit reconciliation with the original transaction or bound finalized state; no automatic resend occurs. Cross-tab exclusion protects updates.

## Business verification and limits

KYB currently collects sample intake for the US, Abu Dhabi mainland or ADGM. Drafts are held in memory and cleared on reload or leaving the KYB layout. File contents are not read or uploaded. Exported preparation states `verified: false`, `credentialIssued: false`, `providerSubmission: not_sent`. No live provider review or payment eligibility is issued. US state/federal and ADGM/mainland tax/legal preparation, deterministic rule evaluation and AI-assisted drafts are future integrations.

Independent vaults hold principal; shared notes authorize a direct payout from one funded vault. Funds do not hop through a sequence of vaults. Public signers, recipients, amounts, timing, vaults and references can correlate activity; more vaults alone do not guarantee anonymity. The protocol and single-machine development setup have no production audit. See [privacy](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md) and [service boundaries](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#current-boundaries).

## Repositories

- [Core](https://github.com/Company-privacy-settlement/Core): browser/Node SDK, proving CLI, read-only API, index and evidence.
- [Contract](https://github.com/Company-privacy-settlement/Contract): contracts, circuit, vectors and WASM builds.
- [Front](https://github.com/Company-privacy-settlement/Front): landing, Docs and wallet interfaces.

There are no external analytics or remote-font requests. Wallet connection loads NEAR Connect’s manifest/provider interfaces on demand.
