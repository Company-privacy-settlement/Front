# Money Station — English product walkthrough

[Watch MP4](../public/media/money-station-demo-en.mp4) · [Hosted player](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/media/) · [Reviewer guide](https://github.com/Company-privacy-settlement/Core/blob/main/docs/HACKATHON.md)

[![Money Station demo](assets/hackathon-demo-poster.png)](../public/media/money-station-demo-en.mp4)

## Media package

The film runs **01:43** at 1920 × 1080, 24 fps, with H.264/AAC, synthetic English narration, burned English captions and SRT/VTT. It follows the current black-and-green product design with animated headlines and actual application screens.

[MP4](../public/media/money-station-demo-en.mp4) · [SRT](../public/media/money-station-demo-en.srt) · [VTT](../public/media/money-station-demo-en.vtt) · [Poster](../public/media/money-station-demo-poster.png) · [Integrity manifest](../public/media/manifest.json)

## Evidence scope

The invoice, checkout and payment scenes use controlled wallet/API/chain-context fixtures with a real locally generated Groth16 proof. The wallet selector is unmodified and no real wallet is authenticated or asked to sign. Receipt disclosure is local; the record is a sample. Tax preparation uses a deterministic source-bound outline in a fixture organization and requests independent review. No live AI/tax provider, public USDC payment, professional approval, filing, effective anonymity or production readiness is established.

The separately recorded native NEAR CLI run is linked from the reviewer guide. It is not depicted in this film. Existing Sites preview permissions are preserved; self-hosted access follows host configuration. Legacy media URLs deliver the same newly branded files, not the previous film.

## Chapters and transcript

### 00:00 — Business is private.

Invoices, payroll, and supplier relationships. Business details should stay with the people who need them.

### 00:08 — Fast money.

Moving money is only half the job. Finance teams still need a clear paper trail.

### 00:16 — Private payments.

Meet Money Station. Private business payments, with evidence you choose to share.

### 00:23 — Start with an invoice.

Scope: Sample wallet & API

Create a signed payment request. Share one link with your customer or business partner.

### 00:32 — Connect. Keep control.

Scope: Actual wallet selector · No payment signed

Connect a supported wallet. Your signing keys stay with your wallet provider.

### 00:39 — Choose your private note.

Scope: Sample wallet & API

Open an encrypted note from its original payment group. Its secrets stay on your device.

### 00:47 — Prove it. Privately.

Scope: Actual local proof · Sample chain context

Generate the proof locally. Authorize the payout without revealing the input note.

### 00:56 — Review. Then approve.

Scope: Sample wallet & API

Check the recipient, full principal, and added fee. Approve each required wallet call.

### 01:05 — Follow the confirmation.

Scope: Sample finalized-state response

Track the original payment through confirmation. An uncertain response never triggers an automatic second payment.

### 01:14 — Share only what’s needed.

Scope: Local receipt disclosure · Sample record

Choose the amount, asset, or invoice reference to disclose. Keep unrelated business information private.

### 01:24 — Ready for finance.

Scope: Source-bound outline · Independent review required

Prepare a cited tax procedure draft, then request independent review. Keep preparation separate from approval.

### 01:34 — Business money.

Money Station. Private payments. Clear proof. Your business stays yours.

## Verify and reproduce

```bash
python3 scripts/demo/verify.py
```

The verifier checks all canonical asset hashes, legacy aliases, chapter/subtitle coverage, embedded Money Station title, H.264/AAC, dimensions, duration, native-source pin and full decode. It does not establish on-chain finality from a recording.

Use sibling Front/Core checkouts, Node.js 22.16+, Python 3, FFmpeg with libx264/libass, Playwright Chromium, `edge-tts==7.3.1` in a separate Python environment and the existing matching development proving files. No real wallet keys or provider credentials are needed. Never replace artifacts for an existing group.

```bash
npm run build
# In a separate terminal, serve the static application:
python3 -m http.server 33539 --bind 127.0.0.1 --directory out
# With the voice virtual environment active:
DEMO_OUTPUT_DIR=/tmp/money-station-demo python scripts/demo/narrate.py
DEMO_OUTPUT_DIR=/tmp/money-station-demo node scripts/demo/record.mjs
DEMO_OUTPUT_DIR=/tmp/money-station-demo node scripts/demo/compose.mjs
DEMO_OUTPUT_DIR=/tmp/money-station-demo python3 scripts/demo/render.py
python3 scripts/demo/verify.py
```

`CORE_CHECKOUT`, `CORE_PROVER_ARTIFACTS_DIR` and `DEMO_BASE_URL` configure local capture. `DEMO_RESUME=1` reuses only completed clips with matching public narration; use it only with unchanged app/proving/fixture inputs. Start in a fresh output directory for a new source version. The compositor uses an ephemeral loopback server and closes it after recording.

## Playback verification

[Desktop and mobile browser report](evidence/money-station-media-2026-11-14.json): actual MP4 playback, chapter seeking, 26 English cues, all four canonical downloads, byte ranges, Money Station titles and a bounded 320px layout passed through local Nginx. This does not establish public HTTPS or real wallet settlement.
