# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

A Next.js landing page and hackathon demo for private B2B settlement and employee payments on NEAR. Contracts and server/SDK code are maintained in separate repositories.

- `/`: protocol landing page explaining distributed vaults, shared anonymity, selective disclosure, and fees.
- `/app/`: demo dashboard, deposits/payments, vault liquidity, activity search, and exports.
- `/app/?view=proofs`: real in-browser verification of a recorded Groth16 proof and selectively disclosed receipts.

## Visual language

The landing and app use one [NEAR.org](https://www.near.org/)-inspired visual language: black and white, vivid green accents, regular-weight type and thin borders. The invoice editor, checkout and settlement layouts retain the existing task flow. Decorative text above headings is removed throughout the landing and app. `src/app/near-theme.css`, `src/app/merchant-theme.css` and `src/app/workspace-layout.css` provide the shared palette and workspace layout; KYB styles live in `src/app/kyb/kyb.css`. DM Sans is self-hosted and `public/core-field.svg` is original artwork. Core retains its own brand and protocol.

App shells fit the dynamic viewport, keep navigation and footer in place, and scroll their main content area. Checkout has one vertical content scroller. Route changes reset the main reading position, while scroll containment prevents chaining into the page. Long forms, tables and reviewed-call details remain reachable on smaller screens.

The invoice editor previews the actual draft title, recipient, fixed-note count, token principal and add-on fee. Amounts remain token atomic units because the trusted group policy does not supply token display decimals. Drafts are not saved. Checkout separates signed request details from payer controls; settlement readiness reflects the verified policy, wallet and local journal, without inventing a custodial balance.

## Business verification / KYB

`/kyb/` is a separate, six-page demo intake: overview → business → people/ownership → documents → review → status. It distinguishes US, Abu Dhabi mainland and ADGM registration. Every page is directly addressable; Next.js navigation preserves the in-memory draft inside this workspace. Refreshing or leaving the KYB layout discards it. Use sample information only. No localStorage, sessionStorage, backend or provider receives this draft.

The evidence step accepts sample PDF/PNG/JPEG metadata up to 10 MB per file; file contents are never read or uploaded. Four evidence records are required for this demo checklist, with optional source-of-funds material. This is an intake template, not a determination of jurisdiction-specific legal requirements. Provider identity checks, screening and review are not connected.

Preparation requires complete business/ownership/evidence sections and an authority acknowledgement. Editing any intake field invalidates preparation and acknowledgement; changing jurisdiction also clears location/registration/authority and selected evidence. The downloadable sample request explicitly sets `verified: false`, `credentialIssued: false` and `providerSubmission: "not_sent"`. The status page does not issue a KYB credential or change payment eligibility. Official references are linked for provider assessment; they are not tax advice or statutory filings.

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

## Recipient-issued invoices

`/invoices/` creates a merchant NEP-413 signed payment request and `/pay/#invoice=...` opens its checkout. Import a trusted testnet FT policy, connect a compatible message-signing merchant wallet, set a payout account/title/reference, 1–32 fixed payment units and expiry, then download the signed JSON and share its link. Open a saved JSON to track it later; the API does not persist business terms.

Checkout verifies the local signature and current merchant full-access key, requires an independently trusted group policy, and imports only withdrawal proofs bound to this invoice root/recipient. Payers prepare private notes/proofs with Core CLI and approve existing wallet operations one at a time. Confirmed index records determine partial, paid, late and overpaid states; a redirect never establishes payment. NEAR storage/gas and any note-funding fee are additional to the 0.15% withdrawal fee.

The interface does not implement fiat conversion, a custodial merchant balance, callbacks, automatic refunds or arbitrary token denominations. Deadlines and invoice caps are application rules; concurrent payers or delayed transactions can overpay/settle late. Signed terms are readable to link holders; downloaded request files are not encrypted backups. Hosting access settings still apply to shared checkout links. See [Core invoice architecture](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICES.md).

## Testnet wallet workspace

`/live/` executes real, reviewed calls for a **user-configured testnet FT shared group**. No public funded deployment is bundled. It uses NEAR Connect 0.12.0; keys stay in the selected wallet. Each token registration, NEAR storage prepayment, token payment or bound recovery call requires a separate review and wallet approval.

1. Run Core’s read-only API with an actual `CORE_POLICY_FILE`, `CORE_RPC_URL`, and the exact Front origin in `CORE_ALLOWED_ORIGINS`. Use an HTTPS API when accessing a hosted Front.
2. Enter the API origin, import a policy obtained independently of the API, and verify that every pinned value matches.
3. Connect a testnet wallet and create/unlock an encrypted local journal with a passphrase of at least 12 characters.
4. Import the **public FT plan JSON** produced by Core CLI `shared-deposit-args` or `shared-spend-args`. Private notes/proofs are generated locally with the CLI; the journal is not a private-note backup.
5. Review exact destinations, atomic token amounts, attached NEAR and additional gas. Sign one step, then refresh until the bound deposit is `Active` or withdrawal is `Complete`.
6. Export the encrypted journal. A lost wallet response blocks another signature; verify the original transaction hash or observe its bound on-chain record to resume. There is no automatic resend or passphrase recovery.

The browser journal uses PBKDF2-SHA256 and AES-256-GCM, with Web Locks excluding concurrent tabs. Unlocking exposes public operation metadata in page memory; Lock clears the client passphrase. Unsupported locks fail closed. Restoring a backup requires empty storage and preserves existing histories by refusing overwrite. The configured API can observe public preparation/status requests.

The browser execution client is vendored from Core in `src/vendor/core-client/` with declarations and a SHA-256 manifest; `npm run build` verifies the hashes. Front builds independently of sibling checkouts. To refresh it, run Core’s `npm run build:client`, then Front’s `npm run sync:core`. See [Core wallet integration](https://github.com/Company-privacy-settlement/Core/blob/main/docs/WALLET.md).

Browser tests use a standard injected fixture wallet and mocked public reads. Core’s sandbox validates actual WASM/proofs and wallet-session execution. A funded external-wallet test against a public testnet deployment remains outstanding.

After verifying the group policy, `/live/` also reads public group activity from the configured API. It shows indexed events, linked/unresolved provenance, outer transaction outcome, checkpoint age, automatic-discovery coverage/waiting status, event/recipient filters and stable load-more pages. No wallet or unlocked journal is needed for public reads. The UI validates the policy, asset, principal and fee fields before rendering records. Disabled/unavailable indexing is explicit and never replaced with demo data. Enable Core’s worker with `CORE_INDEX_DB` and optionally `CORE_DISCOVERY_START_HEIGHT`; refresh reads the database, not the current chain head. These events do not certify complete company history or tax filing.

## Demo scope

On `/app/`, deposits and withdrawals are **simulated entirely in the browser**. Its balances and example companies/people are demo data. Real reviewed wallet calls are in the separate, explicitly configured `/live/` workspace. EOA key generation and dynamic browser proof generation remain outside both interfaces.

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

The demo includes sample US/Abu Dhabi payment flows. Real KYB/KYC providers and AI tax/legal preparation remain future integrations. The code and UI are hackathon development work without a production security audit.

## Structure

```text
src/app/page.tsx              Landing page
src/app/app/page.tsx          Demo entry
src/app/live/page.tsx         Configured testnet wallet entry
src/components/live-workspace.tsx Wallet review and encrypted recovery
src/vendor/core-client       Verified browser SDK bundle and declarations
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

Running and building Front does not require sibling repository directories. The frontend contains no private keys or proving keys. It makes no external analytics/tracking or remote font requests. Wallet connection loads NEAR Connect’s public wallet manifest and provider interfaces on demand.
