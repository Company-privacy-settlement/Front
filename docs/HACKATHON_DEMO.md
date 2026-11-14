# Core — English hackathon demo

[Watch the English MP4](../public/media/core-hackathon-demo-en.mp4) · [Hosted player](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/media/) · [Reviewer guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/HACKATHON.md)

[![Core demo poster](assets/hackathon-demo-poster.png)](../public/media/core-hackathon-demo-en.mp4)

## Media package

The 2026-11-14 recording runs **02:59** at 1600 × 900, 24 fps. It uses H.264 video, AAC audio and synthetic English narration (`en-US-AriaNeural`, edge-tts 7.3.1). English captions and scope labels are burned into the video; optional SRT/VTT files are included. The player does not enable duplicate external captions by default.

- [MP4](../public/media/core-hackathon-demo-en.mp4)
- [English SRT](../public/media/core-hackathon-demo-en.srt) · [English VTT](../public/media/core-hackathon-demo-en.vtt)
- [Poster](../public/media/core-hackathon-demo-poster.png)
- [Integrity manifest and chapter timing](../public/media/manifest.json)
- [Public storyboard](../scripts/demo/storyboard.en.json)

The video is stored once in Front. All three repositories link to it from their English, Korean and Simplified Chinese READMEs. The existing Site remains owner-private; repository access is also unchanged. For judges without access, share the exported media bundle separately. The static player at `/media/` plays a recording; it does not restore the removed interactive demo.

## What the recording shows

| Segment | Evidence scope |
| --- | --- |
| Landing / Docs | Current application screens. |
| Invoice / note / proof / approvals / confirmation | Real application UI and real locally generated Groth16 proof, with a controlled wallet/API/chain-context fixture. `usdc.testnet` is a fixture identifier. These scenes do not represent public USDC execution or a real browser wallet receipt. One confirmed unit leaves the two-unit fixture invoice partially paid. |
| Tax draft / independent review request | Deterministic source-bound outline in a fixture organization. The reviewer signature in the fixture exercises composition, not professional qualifications. No AI provider is called and no internal approval or filing is represented. |
| Native testnet / recovery | Cards summarize the separate actual CLI/software-wallet native NEAR run. Fourteen signed FINAL transactions include deployment/sealing and twelve wallet actions. The original public evidence is hash-pinned below. |
| Boundaries | No effective anonymity, live hosting acceptance, live provider qualification or production readiness claim. |

The recording uses the app built from the Front `8d7d2b5ba793cc4bd999cb79f9bd5f2879b316df` baseline plus this media update and two FAQ accuracy corrections. Public-testnet deployment source revisions remain the original release tuple documented in the reviewer guide. No wallet keys, organization secrets or private testnet work directories are included.

## Chapters and transcript

| Start | Chapter |
| --- | --- |
| 00:00 | Private settlement. Shared confidence. |
| 00:11 | Distributed principal. Shared proof. |
| 00:26 | Start with a signed invoice |
| 00:38 | Generate the proof locally |
| 00:52 | Review before every signature |
| 01:06 | Confirm from finalized observations |
| 01:22 | Turn evidence into a cited draft |
| 01:38 | Separate preparation from approval |
| 01:54 | Fourteen real testnet transactions |
| 02:08 | A real failure. The original destination. |
| 02:24 | A prototype with explicit boundaries |
| 02:47 | Inspect. Run. Verify. |

### 00:00 — Private settlement. Shared confidence.

Scope: CORE · NEAR HACKATHON PROTOTYPE

Meet Core: private business settlement on NEAR, with evidence you choose to share. Built for business invoices, worker payments, and contractor payouts.

### 00:11 — Distributed principal. Shared proof.

Scope: PROTOCOL ARCHITECTURE · PUBLIC METADATA REMAINS VISIBLE

Principal stays in independent vaults. A shared zero knowledge note authorizes a funded vault to pay, without naming the input note. A global nullifier prevents a second spend.

### 00:26 — Start with a signed invoice

Scope: CONTROLLED BROWSER DEMO · FIXTURE WALLET AND API

The recipient creates a signed invoice. Checkout verifies the request, payment unit, merchant, and trusted group before a payer selects an encrypted note.

### 00:38 — Generate the proof locally

Scope: REAL LOCAL GROTH16 PROOF · FIXTURE CHAIN CONTEXT

Here, the browser generates a real Groth sixteen proof using verified proving files. Note secrets and the note password stay local. Proof generation can also be cancelled.

### 00:52 — Review before every signature

Scope: CONTROLLED BROWSER DEMO · NO PUBLIC USDC TRANSFER

Review the amount and the added fifteen basis point fee. The recipient receives the full principal. Storage and network gas are separate, and each required wallet call is reviewed individually.

### 01:06 — Confirm from finalized observations

Scope: FIXTURE FINALITY OBSERVATION · NOT A LIVE WALLET RECEIPT

The payment view reconciles finalized observations. An uncertain response stays unresolved until checked, avoiding an automatic second payment. This browser walkthrough uses a test wallet and API fixtures.

### 01:22 — Turn evidence into a cited draft

Scope: SOURCE-BOUND OUTLINE DEMO · NO LIVE AI OR PROFESSIONAL APPROVAL

Teams can prepare cited tax and procedure drafts from verified rule calculations and selected evidence. This example uses deterministic outline mode. Unsupported obligations remain visible for review.

### 01:38 — Separate preparation from approval

Scope: DEMO ORGANIZATION · INDEPENDENT REVIEW REQUIRED

Submit an immutable revision for another authorized reviewer. The author cannot approve their own preparation. Changes require a new revision, and source or permission changes invalidate reliance.

### 01:54 — Fourteen real testnet transactions

Scope: RECORDED PUBLIC TESTNET EVIDENCE · NATIVE NEAR · CLI WALLET

Separately, the native NEAR software wallet run recorded fourteen real public testnet transactions. Two deposits of point one NEAR reached keyless vaults, followed by successful payouts.

### 02:08 — A real failure. The original destination.

Scope: RECORDED PUBLIC TESTNET EVIDENCE · RETRYABLE TO COMPLETE

A missing recipient caused an actual failed transfer. After activating that same recipient, recovery kept the original nullifier, vault, amount, and destination. The retry charged no second protocol fee.

### 02:24 — A prototype with explicit boundaries

Scope: PRIVACY DEPENDS ON PARTICIPATION AND METADATA

The read only verifier rechecks receipts, signatures, code, keys, and historical balances. This does not establish effective anonymity. Browser wallet and USDC public testnet qualification, live hosting, and production review remain separate.

### 02:47 — Inspect. Run. Verify.

Scope: CORE · CONTRACT · FRONT · ENGLISH-FIRST DOCUMENTATION

Explore the three repositories, follow the quick start, and verify the published transaction evidence. Core: private settlement, shared confidence.

## Verify the assets

File sizes and SHA-256 values are recorded in the [manifest](../public/media/manifest.json). From Front, using Python 3 and FFmpeg/ffprobe:

```bash
python3 scripts/demo/verify.py
```

The verification command checks media hashes, subtitle timing, source-evidence hash, video/audio codecs, dimensions, duration, chapter coverage and the full decode. It does not infer chain finality from a recording. Use the separate read-only chain verifier in the reviewer guide for public RPC evidence.

## Reproduce the recording

Use sibling Front and Core checkouts, Node.js 22.16+, Python 3, FFmpeg/ffprobe with libx264/libass, Playwright Chromium and a matching **development-only** Core proving setup. No private wallet or API credentials are needed. The browser fixtures are imported from the repository tests; they are never added to the app runtime.

1. In Core, install dependencies and prepare matching development proving artifacts following the existing setup guide. Never replace artifacts for an existing group.
2. In Front, run `npm ci`, `npx playwright install chromium` and `npm run build`.
3. Serve `out/` on `127.0.0.1:33539` in a separate terminal:

```bash
python3 -m http.server 33539 --bind 127.0.0.1 --directory out
```

4. Generate narration in an isolated Python environment. This sends only the public storyboard text to the external TTS service:

```bash
python3 -m venv /tmp/core-demo-voice
/tmp/core-demo-voice/bin/pip install edge-tts==7.3.1
DEMO_OUTPUT_DIR=/tmp/core-hackathon-demo \
  /tmp/core-demo-voice/bin/python scripts/demo/narrate.py
```

5. Record the actual app and render the narrated video:

```bash
DEMO_OUTPUT_DIR=/tmp/core-hackathon-demo node scripts/demo/record.mjs
DEMO_OUTPUT_DIR=/tmp/core-hackathon-demo python3 scripts/demo/render.py
python3 scripts/demo/verify.py
```

`CORE_CHECKOUT`, `CORE_PROVER_ARTIFACTS_DIR` and `DEMO_BASE_URL` can override the sibling checkout, proving artifacts and local base URL. Rendering updates Front media and the three README posters. Chapter timing and generated asset hashes can change on a new recording; update this transcript from the resulting manifest. Use `DEMO_RESUME=1` only to reuse complete chapters from the same source/setup; use `DEMO_REUSE_RENDERS=1` only when the recording, voice clips and renderer are unchanged.

## Native evidence source

Core `docs/evidence/testnet-wallet-2026-11-14.json`

```text
e009bd0f600b23e0fabe30064ee3211446682946126d1b341aace34b5981a681
```

[Original runbook and transaction links](https://github.com/Company-privacy-settlement/Core/blob/main/docs/TESTNET_WALLET.md) · [Privacy boundaries](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md#participation-and-cover-traffic)

## Submission playback check — 2026-11-14

[Local browser report](evidence/hackathon-media-2026-11-14.json): desktop and mobile Chromium played the actual MP4, sought to the recovery chapter, loaded English VTT, retrieved the download assets and stayed within viewport width. The local QA server supported HTTP byte ranges, as required for seeking; Python's simple HTTP server is sufficient for the recording walkthrough but does not implement range responses for reliable chapter seeking.
