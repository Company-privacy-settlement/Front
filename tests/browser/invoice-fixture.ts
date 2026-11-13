import { expect, type Page } from "@playwright/test";
import { generateKeyPairSync, createHash, sign } from "node:crypto";
import { invoiceFromFragment } from "../../src/vendor/core-client/index.js";
export const policy = {
  network: "testnet",
  registry: "forest.testnet",
  denomination: "1000000",
  tokenId: "usdc.testnet",
  feeRecipient: "treasury.testnet",
  registryWasmSha256: "aa".repeat(32),
  vaultWasmSha256: "bb".repeat(32),
  verifierSha256: "cc".repeat(32),
};
export const hash = "B".repeat(44),
  vault = `v${"a".repeat(32)}.forest.testnet`;
function base58(b: Buffer) {
  const a = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let n = BigInt("0x" + b.toString("hex")),
    s = "";
  while (n) {
    s = a[Number(n % 58n)] + s;
    n /= 58n;
  }
  for (const x of b) {
    if (x !== 0) break;
    s = "1" + s;
  }
  return s;
}
function string(s: string) {
  const b = Buffer.from(s),
    size = Buffer.alloc(4);
  size.writeUInt32LE(b.length);
  return Buffer.concat([size, b]);
}
export async function fixture(page: Page) {
  const key = generateKeyPairSync("ed25519"),
    publicKey =
      "ed25519:" +
      base58(
        key.publicKey.export({ format: "der", type: "spki" }).subarray(-32),
      ),
    settled = new Set<string>(),
    paymentRoots = new Map<string, string>();
  let invoiceDigest = "";
  const bodies: unknown[] = [];
  await page.exposeFunction(
    "fixtureInvoiceSign",
    ({
      message,
      nonce,
      recipient,
    }: {
      message: string;
      nonce: number[];
      recipient: string;
    }) => {
      const tag = Buffer.alloc(4);
      tag.writeUInt32LE(2 ** 31 + 413);
      const digest = createHash("sha256")
        .update(
          Buffer.concat([
            tag,
            string(message),
            Buffer.from(nonce),
            string(recipient),
            Buffer.from([0]),
          ]),
        )
        .digest();
      return {
        accountId: "merchant.testnet",
        publicKey,
        signature: sign(null, digest, key.privateKey).toString("base64"),
      };
    },
  );
  await page.exposeFunction("fixtureInvoicePay", (payment: { nullifier: string; root: string }) => {
    settled.add(payment.nullifier);
    paymentRoots.set(payment.nullifier, payment.root);
  });
  await page.route(
    "https://raw.githubusercontent.com/hot-dao/**/manifest.json",
    (r) => r.fulfill({ json: { wallets: [], version: "1" } }),
  );
  await page.addInitScript(() => {
    const account = () =>
      localStorage.getItem("fixtureInvoiceAccount") || "merchant.testnet";
    const wallet = {
      manifest: {
        id: "invoice-fixture",
        name: "Invoice Fixture Wallet",
        type: "injected",
        platform: ["web"],
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        permissions: {},
        features: {
          testnet: true,
          mainnet: false,
          signMessage: true,
          signAndSendTransaction: true,
          signInWithoutAddKey: true,
        },
      },
      signIn: async () => [{ accountId: account() }],
      getAccounts: async () => [{ accountId: account() }],
      signOut: async () => {},
      signMessage: async (p: {
        message: string;
        nonce: Uint8Array;
        recipient: string;
      }) =>
        (window as any).fixtureInvoiceSign({
          message: p.message,
          nonce: Array.from(p.nonce),
          recipient: p.recipient,
        }),
      signAndSendTransaction: async (p: any) => {
        const msg = JSON.parse(p.actions[0].params.args.msg);
        await (window as any).fixtureInvoicePay({ nullifier: msg.public_inputs[0], root: msg.disclosure_root });
        return { transaction: { hash: "B".repeat(44), signer_id: account() } };
      },
    };
    window.addEventListener("near-selector-ready", () =>
      window.dispatchEvent(
        new CustomEvent("near-wallet-injected", { detail: wallet }),
      ),
    );
  });
  await page.route("https://core-api.example/**", async (route) => {
    const path = new URL(route.request().url()).pathname,
      body = route.request().postDataJSON();
    if (body) bodies.push(body);
    let json: unknown;
    if (path === "/v1/config") json = { policy };
    else if (path === "/v1/invoices/verify") {
      invoiceDigest = body.invoiceHash;
      json = {
        verified: true,
        merchantAccount: body.merchantAccount,
        invoiceHash: body.invoiceHash,
        checkedAt: { hash, height: 200 },
        claims: { legalIdentityVerified: false, kybVerified: false },
      };
    } else if (path === "/v1/invoices/status") {
      const n = settled.size,
        expected = BigInt(body.units) * 1000000n,
        paid = BigInt(n) * 1000000n,
        roots = body.version === 2 ? body.paymentNonces.map((nonce: string) => createHash("sha256").update(`core:invoice:payment:v2|${body.invoiceHash}|${nonce}`).digest("hex")) : [];
      json = {
        invoiceHash: body.invoiceHash,
        settlementRoot: body.version === 2 ? null : createHash("sha256").update("core:invoice:settlement:v1|" + body.invoiceHash).digest("hex"),
        ...(body.version === 2 ? { settlementRoots: roots, reusedPaymentReferences: settled.size - new Set([...settled].map(v => paymentRoots.get(v))).size } : {}),
        state: n === body.units ? "paid" : n ? "partial" : "awaiting_payment",
        expectedTokens: expected.toString(),
        paidTokens: paid.toString(),
        remainingTokens: (expected - paid).toString(),
        overpaidTokens: "0",
        lateTokens: "0",
        confirmedPayments: n,
        coverageLimited: false,
        checkedAt: { hash, height: 200, updatedAt: new Date().toISOString() },
        chainFreshnessChecked: false,
        confirmations: [...settled].map((v, i) => ({
          ...(body.version === 2 ? { settlementRoot: paymentRoots.get(v) } : {}),
          recordIndex: i,
          nullifier: v,
          blockHeight: 150,
          late: false,
          transaction: { hash, signer: "payer.testnet" },
        })),
      };
    } else if (path === "/v1/ft/preflight")
      json = {
        canPrepare: true,
        prerequisitesSatisfied: true,
        prerequisites: [],
        blockers: [],
        tokenAmountRequired: "1500",
        payerTokenBalance: "1000000",
        checkedAtBlock: { hash, height: 200 },
      };
    else if (path === "/v1/settlements/status") {
      const complete = settled.has(body.nullifier);
      json = {
        state: complete ? "Complete" : "NotFound",
        complete,
        refunded: false,
        retryAvailable: false,
        refundAvailable: false,
        retryCall: null,
        refundCall: null,
        record: complete
          ? {
              state: "Complete",
              vault: body.expectedVault,
              recipient: body.expectedRecipient,
              disclosure_root: body.expectedDisclosureRoot,
            }
          : null,
        checkedAtBlock: { hash, height: 200 },
      };
    } else {
      await route.fulfill({
        status: 503,
        json: { error: "INDEX_DISABLED" },
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    await route.fulfill({
      json,
      headers: { "access-control-allow-origin": "*" },
    });
  });
  return { settled, bodies, getDigest: () => invoiceDigest };
}
export async function issue(page: Page) {
  await page.goto("/invoices/");
  await page.getByLabel("Core API origin").fill("https://core-api.example");
  await page
    .getByLabel("Trusted FT policy JSON")
    .setInputFiles({
      name: "policy.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(policy)),
    });
  await page.getByRole("button", { name: "Connect merchant wallet" }).click();
  await page.getByText("Invoice Fixture Wallet", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "merchant.testnet" }),
  ).toBeVisible();
  await page
    .getByLabel("Invoice title", { exact: true })
    .fill("Design milestone");
  await page.getByLabel("Invoice reference").fill("INV-2026-007");
  await page.getByLabel("Payout NEAR account").fill("recipient.testnet");
  await page.getByLabel("Number of notes").fill("2");
  await page
    .getByRole("button", { name: "Sign & create payment link" })
    .click();
  await expect(page.getByLabel("Payment link")).toBeVisible();
  const link = await page.getByLabel("Payment link").inputValue();
  return { link, signed: invoiceFromFragment(new URL(link).hash) };
}
