# Money Station deployment

Money Station is the English-first customer interface for the Core protocol. The product uses the connected wallet on NEAR testnet; interface badges are not used to select or change the network. Real wallet confirmations retain the wallet provider's network information. Business records and selective payment evidence support reconciliation, tax preparation and professional review; they do not constitute automatic statutory filing or a legal compliance guarantee.

## Public service profile

Use `.env.example` to provide build-time public configuration:

- `NEXT_PUBLIC_MONEY_STATION_API_ORIGIN`: exact HTTPS settlement API origin.
- `NEXT_PUBLIC_MONEY_STATION_ORGANIZATION_ORIGIN`: exact HTTPS Organization API origin.
- `NEXT_PUBLIC_MONEY_STATION_RELAY_ORIGIN`: exact HTTPS optional proof relay origin.
- `NEXT_PUBLIC_MONEY_STATION_POLICY_JSON`: the independently reviewed FT SharedPolicy for this deployment.
- `NEXT_PUBLIC_MONEY_STATION_POLICY_SHA256`: SHA-256 of its canonical JSON, obtained independently of the API.

No signing key, note secret, password or provider API key belongs in these public variables. Service configuration never substitutes for wallet transaction approval. Customer balances, KYB decisions and payment statuses are not simulated by this profile.

`npm run verify:deployment` checks exact HTTPS origins, wallet network, token policy and independent digest before every build. In the release pipeline, set `MONEY_STATION_REQUIRE_DEPLOYMENT=1` to reject missing payment, organization or relay services. The flag is a configuration gate; it does not certify deployed service health, contract security or legal readiness.

With a valid profile, the settlement workspace compares the live API policy with the independently pinned policy before marking the payment network configured. Manual configuration takes precedence over a late bootstrap response. Other workspaces reuse the published service origins. An unconfigured build leaves service fields empty and does not silently call a visitor's localhost or imply a funded service.

## Wallet flow

The landing and workspace use the same NEAR Connect instance and session. Connection opens a real wallet selector. Concurrent connection clicks share one pending connection, and immediate delivery is the default; delayed delivery remains opt-in. No customer signing key is imported, no access key is added by this app, and no payment transaction is signed by connecting. Sign-in and disconnect update the workspace; identity rechecks on window focus and before dispatch pick up account changes. A changed payer invalidates the reviewed payment and locks an open journal; execution still checks wallet identity immediately before dispatch.

All actual transactions remain on the configured test network. The app never silently switches to mainnet or conceals the provider's transaction approval screen. Removing repeated network badges is a presentation change.

## Qualification before business use

The current repository still uses development proving material (`UNSAFE_LOCAL_DEVELOPMENT_ONLY`). Production security review and a reviewed ceremony/verifier release are outstanding. Public browser-wallet USDC funding/execution, external API/indexer/organization/relay HTTPS qualification, live KYB/AI provider qualification and professional tax-rule approval remain separate operational gates. The published interface does not claim that those gates passed.

Prepare and verify the accounts, funding, policy, contracts, DNS/TLS and exact frontend CORS origins through the existing Core deployment/hosting scripts. Keep the API, indexer and Organization API separate from the static frontend. Existing Site audience is preserved; organization membership does not grant Site access.

[Core deployment](https://github.com/Company-privacy-settlement/Core/blob/main/docs/DEPLOYMENT.md) · [HTTPS hosting qualification](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRODUCTION_HOSTING.md) · [Browser USDC qualification](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_USDC_TESTNET.md)

## Recorded frontend validation — 2026-11-14

Type checking, static export and 12 unit tests passed. The full 280-case desktop/mobile browser suite passed with the repository's two-worker setting, including actual local WASM/Groth16 proving and injected wallet/API fixtures. A real unmodified NEAR Connect selector displayed supported providers; no human wallet login or payment signature was performed during that inspection.

[Validation record](evidence/money-station-frontend-2026-11-14.json) · [Desktop landing](assets/money-station-landing-desktop.png) · [Mobile landing](assets/money-station-landing-mobile.png) · [Desktop workspace](assets/money-station-workspace-desktop.png) · [Mobile workspace](assets/money-station-workspace-mobile.png) · [Real wallet selector](assets/money-station-wallet-picker.png)

## Ubuntu domain hosting

[Isolated h2on.xyz deployment](UBUNTU_HOSTING.md) provides a separate static service, exact-host Nginx route, verified release archive and DNS-independent acceptance checks. It preserves the Sites preview permissions. Domain DNS and HTTPS activation are separate steps; it does not provision the backend services or qualify browser settlement.
