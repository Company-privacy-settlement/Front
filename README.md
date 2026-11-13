# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

English-first documentation and wallet interfaces for private business settlement on NEAR, built with Next.js. Smart contracts and server/SDK code live in separate repositories. The interactive simulation has been removed; the landing now leads to Docs and the configured testnet workspace.

## Documentation

`/docs/` provides nine statically exported guides with searchable navigation, section links, a table of contents, previous/next links, and a mobile menu. English is the default language for the site and documentation. These README files remain available in English, Korean, and Simplified Chinese.

| Route | Guide |
| --- | --- |
| `/docs/` | Getting started, local setup, and the first-settlement sequence |
| `/docs/architecture/` | Keyless vaults, shared notes, destination binding, and group capacity |
| `/docs/payments/` | Deposits, withdrawals, 0.15% additive fees, and separate NEAR costs |
| `/docs/invoices/` | Recipient-signed invoices, per-payment references, checkout, and reconciliation |
| `/docs/groups/` | Approved directories, capacity selection, and original-group recovery |
| `/docs/privacy/` | Private proof statement, public metadata, and selective evidence |
| `/docs/kyb/` | Sample business intake and provider boundaries |
| `/docs/sdk-api/` | CLI/browser SDK, read-only API endpoints, and finalized indexing |
| `/docs/recovery/` | Uncertain wallet outcomes, bound retries, backups, and limits |

`src/lib/docs.ts` contains the typed guide content. Docs uses the same black, white, and green visual language as the landing, with no decorative labels above article headings. App and Docs shells fit the dynamic viewport and scroll their reading area, with mobile navigation and horizontal containment for tables/code. Existing `/app/` links redirect to the corresponding documentation; no simulation dashboard is rendered.

## Run and verify

Requires Node.js 22 or later.

```sh
npm ci
npm run dev

npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run build` verifies the vendored Core SDK and exports the site into `out/`. Front builds without sibling repositories and needs no bundled API keys. Browser checks cover documentation navigation and legacy routes, invoices, indexed activity, wallet recovery, KYB, and narrow-screen layout.

## Wallet settlement and invoices

Settlements includes an approved-group selector. Import a caller-held directory, enter a Core API per group, and inspect verified capacity. Every selection rechecks policy/status. Full or deposit-disabled groups support recovery mode, which rejects new deposit imports and keeps the original group journal. Group controls lock while a journal is open. See `/docs/groups/` and [Core’s guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/GROUPS.md).

`/live/` executes reviewed testnet FT calls for an independently configured deployment. Run the matching Core read-only API and index, import a policy obtained independently of that API, and compare every pinned value. A hosted Front needs a reachable HTTPS API with its exact origin allowed in CORS. No funded public-network group is bundled.

Connect a compatible NEAR testnet wallet and create/unlock an encrypted local operation journal. FT notes and deposit plans can be prepared at `/notes/`; Groth16 spend proofs stay in the Core CLI; the browser imports public FT plans and reviews registrations, storage, token principal/fees, and gas before individual approvals. The journal uses passphrase-derived encryption and cross-tab exclusion. An uncertain signature stays blocked across reload; verify the original transaction or bound finalized state. No automatic resend or passphrase recovery is provided. The journal is not a private-note backup.

`/invoices/` signs recipient-issued NEP-413 payment requests and `/pay/#invoice=...` opens checkout. New terms v2 use a distinct signed reference per payment unit; legacy v1 remains readable. The client checks current merchant FullAccess ownership, independently trusted policy, exact proof destination, indexed totals/late flags, reference reuse, and coverage. Expiry and single-use references are application rules, not on-chain reservations; races and overpayments remain visible. Refresh failures and trust changes clear prior checkout status, and obsolete responses are ignored.

Save the signed invoice JSON before leaving. Terms remain client-held, with no server inbox, merchant custody, webhooks, fiat conversion, or automatic refunds. Link holders and the API can associate references. A wallet approval or redirect does not establish paid status. Current hosted access remains owner-private and applies to shared checkout links.

## Business verification

`/kyb/` is a separate six-page sample intake: overview, business, people/ownership, documents, review, and status. It distinguishes the US, Abu Dhabi mainland, and ADGM. The in-memory draft is discarded on reload or leaving the KYB layout. Use sample information. File contents are never read/uploaded; sample metadata is retained for the local request only.

Preparation requires complete intake and an authority acknowledgement. Edits invalidate preparation; jurisdiction changes clear dependent data. Exports explicitly set `verified: false`, `credentialIssued: false`, and `providerSubmission: not_sent`. No provider receives the request and no credential or payment eligibility is issued. AI tax/legal preparation and statutory filing remain separate integrations.

## Protocol and integration boundaries

Principal remains in independent vaults. Shared notes authorize a direct payout from one funded vault; there is no sequence of principal hops. Input-note membership is hidden by the proof, while public recipients, amounts, timing, vaults, signers, and references can still correlate activity. Each group supports fixed denominations and 256 total outputs. This development protocol has no production security audit.

Core's browser bundle and declarations are vendored in `src/vendor/core-client/` with a SHA-256 manifest. To refresh them, run Core's `npm run build:client`, then Front's `npm run sync:core`. Front makes no external analytics or remote font requests. Wallet connection loads NEAR Connect's wallet manifest/provider interfaces on demand.

- [Contract](https://github.com/Company-privacy-settlement/Contract): contracts, circuits, vectors, and WASM builds.
- [Core](https://github.com/Company-privacy-settlement/Core): local proving, wallet SDK, API, index, and evidence.
- [Front](https://github.com/Company-privacy-settlement/Front): documentation and wallet interfaces.

The Invoices page includes an optional encrypted local invoice library. Explicitly save signed requests, search/open them later, and export/restore/merge encrypted backups. Merchant/network namespaces, immutable signed IDs and Web Locks protect local updates. No terms are sent to Core and no paid-status cache is stored. See [the library guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICE_LIBRARY.md).

Invoice creation, signed checkout and prepared withdrawals include a read-only recipient check: account activation, token registration, exact observed storage cost and an inspectable public registration call. Recipient/API/policy changes invalidate snapshots. Checking does not sign, fund or send a payment. [Recipient guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/RECIPIENTS.md).

The `/notes/` workspace generates FT notes locally, downloads encrypted single-note backups and requires reopening the backup before public deposit preparation. Download the public plan and import it in Settlements for individual wallet approvals. Backups work directly with shared/group CLI spend commands. Notes are not persisted in browser storage; locking or leaving requires reopening the saved file. [Guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_NOTES.md).

Private notes and the invoice library lock on page-hide and persisted history-cache return, clearing the rendered private view and cancelling pending work. Reopen the saved note backup or unlock the encrypted library to continue. The expected backup policy is snapshotted before decryption, and a targeted last-vault check remains a partial scan. [Review](https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-13-NOTES.md).

Settlement journals also lock on page-hide and persisted cache return. Pending unlock, import, review, export and approval work is invalidated. Already-open wallet requests cannot be undone; the saved signing intent remains blocked for explicit reconciliation. [Journal review](https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-13-JOURNAL.md).
