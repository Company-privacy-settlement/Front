import { test, expect, type Page, type Route } from "@playwright/test";
import { generateKeyPairSync, createHash, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  invoiceFromFragment,
  invoiceRoot,
  type SignedInvoice,
} from "../../src/vendor/core-client/index.js";
const policy = {
  network: "testnet",
  registry: "forest.testnet",
  denomination: "1000000",
  tokenId: "usdc.testnet",
  feeRecipient: "treasury.testnet",
  registryWasmSha256: "aa".repeat(32),
  vaultWasmSha256: "bb".repeat(32),
  verifierSha256: "cc".repeat(32),
};
const hash = "B".repeat(44),
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
async function fixture(page: Page) {
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
async function issue(page: Page) {
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
const field = (s: string) => {
  const b = createHash("sha256").update(s).digest();
  b[0] &= 31;
  return BigInt("0x" + b.toString("hex")).toString();
};
async function plan(signed: SignedInvoice, nf: string, wrong = false, paymentIndex = 0) {
  const root = wrong ? "ff".repeat(32) : await invoiceRoot(signed.invoice, paymentIndex),
    domain = field(`core:ft:v3|testnet|forest.testnet|usdc.testnet|1000000`),
    context = field(
      `core:action:ft:v3|${domain}|withdraw|${vault}|recipient.testnet|${root}`,
    );
  return {
    tokenCall: {
      contract: "usdc.testnet",
      method: "ft_transfer_call",
      args: {
        receiver_id: "forest.testnet",
        amount: "1500",
        msg: JSON.stringify({
          vault,
          recipient: "recipient.testnet",
          disclosure_root: root,
          proof: Buffer.alloc(256).toString("base64"),
          public_inputs: [nf, "2", "3", context, domain],
        }),
      },
      attachedYoctoNear: "1",
      gas: "300000000000000",
    },
  };
}
test("invoice draft preview updates exact token amounts and rejects out-of-range note counts", async ({ page }) => {
  await page.goto("/invoices/");
  const preview = page.getByRole("complementary", { name: "Invoice preview" });
  await expect(preview.getByText("Unsigned draft", { exact: true })).toBeVisible();
  await page.getByLabel("Trusted FT policy JSON").setInputFiles({ name: "policy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(policy)) });
  await page.getByLabel("Invoice title", { exact: true }).fill("Service milestone");
  await page.getByLabel("Payout NEAR account").fill("recipient.testnet");
  await page.getByLabel("Number of notes").fill("32");
  await expect(preview.getByText("Service milestone", { exact: true })).toBeVisible();
  await expect(preview.getByText("recipient.testnet", { exact: true })).toBeVisible();
  await expect(preview.locator(".invoice-paper-total>strong")).toHaveText("32000000");
  await expect(preview.locator(".invoice-paper-fee>strong")).toHaveText("48000");
  await page.getByLabel("Number of notes").fill("33");
  await expect(preview.locator(".invoice-paper-total>strong")).toHaveText("—");
  await page.getByLabel("Number of notes").fill("2");
  await expect(preview.locator(".invoice-paper-total>strong")).toHaveText("2000000");
  await expect(preview.locator(".invoice-paper-fee>strong")).toHaveText("3000");
});
test("recipient signs an invoice, payer rejects another invoice proof, and two confirmed notes cover the request", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const f = await fixture(page),
    created = await issue(page);
  expect(created.signed.invoice.units).toBe(2);
  expect(created.signed.invoice.version).toBe(2);
  expect(await invoiceRoot(created.signed.invoice, 0)).not.toBe(await invoiceRoot(created.signed.invoice, 1));
  await page.screenshot({ path: info.outputPath("invoice-created.png"), fullPage: true });
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download signed invoice" }).click();
  expect((await file).suggestedFilename()).toContain("core-invoice-");
  await page.evaluate(() =>
    localStorage.setItem("fixtureInvoiceAccount", "payer.testnet"),
  );
  await page.goto(created.link);
  await expect(
    page.getByRole("heading", { name: "Design milestone", exact: true }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    const viewport = page.viewportSize()!;
    await page.setViewportSize({ width: 320, height: 568 });
    for (const selector of [".checkout-topbar .brand", ".checkout-continue", ".checkout-back"])
      await expect(page.locator(selector)).toBeInViewport({ ratio: 1 });
    await page.setViewportSize(viewport);
  }
  await page.screenshot({ path: info.outputPath("checkout.png"), fullPage: true });
  await page.getByLabel("Core API origin").fill("https://core-api.example");
  await page
    .getByLabel("Trusted policy JSON")
    .setInputFiles({
      name: "policy.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(policy)),
    });
  await page.getByRole("button", { name: "Verify API policy" }).click();
  await page
    .getByRole("button", { name: "Verify merchant & refresh payment" })
    .click();
  await expect(
    page.getByText("Awaiting payment", { exact: true }),
  ).toBeVisible();
  for (const index of [0, 1]) {
    await page.getByRole("combobox", { name: "Payment unit", exact: true }).selectOption(String(index));
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download proof action" }).click();
    const path = await (await download).path();
    expect(JSON.parse(await readFile(path!, "utf8"))).toEqual({ kind: "withdraw", target: created.signed.invoice.recipient, disclosureRoot: await invoiceRoot(created.signed.invoice, index) });
  }
  await page.getByRole("button", { name: "Connect testnet wallet" }).click();
  await page.getByText("Invoice Fixture Wallet", { exact: true }).click();
  await page
    .getByLabel("Journal passphrase")
    .fill("invoice checkout test password");
  await page.getByRole("button", { name: "Create journal" }).click();
  const input = page.getByLabel("Public FT payment plan");
  await expect(input).toBeEnabled();
  const statusUrl = "https://core-api.example/v1/invoices/status";
  const failStatus = (route: Route) => route.fulfill({ status: 503, json: { error: "INDEX_READ_FAILED" }, headers: { "access-control-allow-origin": "*" } });
  await page.route(statusUrl, failStatus);
  await page.getByRole("button", { name: "Verify merchant & refresh payment" }).click();
  await expect(page.locator(".invoice-error")).toContainText("503");
  await expect(input).toBeDisabled();
  await expect(page.locator(".invoice-status")).toHaveCount(0);
  await page.unroute(statusUrl, failStatus);
  await page.getByRole("button", { name: "Verify merchant & refresh payment" }).click();
  await expect(input).toBeEnabled();
  await input.setInputFiles({
    name: "wrong.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(await plan(created.signed, "42", true))),
  });
  await expect(page.locator(".live-feedback[role=alert]")).toContainText(
    "invoice root",
  );
  expect(f.settled.size).toBe(0);
  for (const [paymentIndex, nf] of ["42", "43"].entries()) {
    await expect(input).toBeEnabled();
    await input.setInputFiles({
      name: "payment.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(await plan(created.signed, nf, false, paymentIndex))),
    });
    await page
      .getByRole("button", { name: "Approve payment in wallet" })
      .click();
    await expect(page.locator(".live-review")).toContainText(
      "Confirmed by finalized contract state",
    );
    await page
      .getByRole("button", { name: "Verify merchant & refresh payment" })
      .click();
    await expect(
      page.getByText(
        nf === "42" ? "Partially paid" : "Paid in indexed confirmations",
        { exact: true },
      ),
    ).toBeVisible();
    if (paymentIndex === 0) {
      await expect(page.getByRole("combobox", { name: "Payment unit", exact: true })).toHaveValue("1");
      await page.getByRole("combobox", { name: "Payment unit", exact: true }).selectOption("0");
      await expect(page.getByRole("button", { name: "Download proof action" })).toBeDisabled();
      await page.getByRole("combobox", { name: "Payment unit", exact: true }).selectOption("1");
      await input.setInputFiles({ name: "reused-reference.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(await plan(created.signed, "44", false, 0))) });
      await expect(page.locator(".live-feedback[role=alert]")).toContainText("already has an indexed payment");
      expect(f.settled.size).toBe(1);
    }
  }
  expect(f.settled.size).toBe(2);
  await expect(input).toBeDisabled();
  expect(JSON.stringify(f.bodies)).not.toContain("Design milestone");
  expect(JSON.stringify(f.bodies)).not.toContain("INV-2026-007");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page
    .locator(".invoice-summary")
    .screenshot({ path: info.outputPath("invoice-paid.png") });
  expect(errors).toEqual([]);
});
test("a late invoice lookup cannot restore verified status after deployment trust changes", async ({ page }) => {
  await fixture(page);
  const created = await issue(page);
  await page.goto(created.link);
  await page.getByLabel("Core API origin").fill("https://core-api.example");
  const policyFile = { name: "policy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(policy)) };
  await page.getByLabel("Trusted policy JSON").setInputFiles(policyFile);
  await page.getByRole("button", { name: "Verify API policy" }).click();
  let release!: () => void, started!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const observed = new Promise<void>(resolve => { started = resolve; });
  const statusUrl = "https://core-api.example/v1/invoices/status";
  await page.route(statusUrl, async route => { started(); await held; await route.fallback(); });
  await page.getByRole("button", { name: "Verify merchant & refresh payment" }).click();
  await observed;
  // Reimport invalidates prior API trust while the independent summary read is pending.
  await page.getByLabel("Trusted policy JSON").setInputFiles(policyFile);
  await expect(page.getByRole("button", { name: "Verify API policy", exact: true })).toBeVisible();
  const response = page.waitForResponse(statusUrl);
  release(); await (await response).finished();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.locator(".invoice-status")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Verify merchant & refresh payment" })).toBeDisabled();
});
test("changing a signed invoice invalidates checkout before any payment interface appears", async ({
  page,
}) => {
  const f = await fixture(page),
    created = await issue(page);
  const changed = structuredClone(created.signed);
  changed.invoice.recipient = "attacker.testnet";
  const fragment = Buffer.from(JSON.stringify(changed)).toString("base64url");
  await page.goto("/pay/#invoice=" + fragment);
  await expect(
    page.getByRole("heading", { name: "Invoice could not be verified" }),
  ).toBeVisible();
  await expect(page.getByLabel("Public FT payment plan")).toHaveCount(0);
  expect(f.settled.size).toBe(0);
});
