import { test, expect, type Page, type Route } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  invoiceRoot,
  createInvoice,
  invoiceHash,
  invoiceMessage,
  nonceBytes,
  INVOICE_SIGNING_RECIPIENT,
  verifySignedInvoice,
  invoiceLink,
  type SignedInvoice,
} from "../../src/vendor/core-client/index.js";
import { fixture, issue, policy, hash, vault } from "./invoice-fixture";
async function secondInvoice(page: Page, first: SignedInvoice) {
  const invoice = createInvoice({ ...first.invoice, title: "Second invoice", recipient: "second-recipient.testnet" });
  const payload = { message: invoiceMessage(await invoiceHash(invoice), invoice.policy.network), nonce: Array.from(nonceBytes(invoice.nonce)), recipient: INVOICE_SIGNING_RECIPIENT };
  const signature = await page.evaluate(p => (window as any).fixtureInvoiceSign(p), payload);
  return verifySignedInvoice({ invoice, signature });
}

test("invoice fragment changes clear the previous payment session and browser history re-verifies each invoice", async ({ page }) => {
  await fixture(page);
  const first = await issue(page), second = await secondInvoice(page, first.signed);
  const secondLink = invoiceLink(new URL(first.link).origin, second);
  await page.evaluate(() => localStorage.setItem("fixtureInvoiceAccount", "payer.testnet"));
  await page.goto(first.link);
  await expect(page.getByRole("heading", { name: "Design milestone", exact: true })).toBeVisible();
  await page.locator(".checkout-continue").click();
  expect(new URL(page.url()).hash).toBe(new URL(first.link).hash);
  await page.getByLabel("Core API origin").fill("https://core-api.example");
  await page.getByLabel("Trusted policy JSON").setInputFiles({ name: "policy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(policy)) });
  await page.getByRole("button", { name: "Verify API policy" }).click();
  await page.getByRole("button", { name: "Verify merchant & refresh payment" }).click();
  await page.getByRole("button", { name: "Connect testnet wallet" }).click();
  await page.getByText("Invoice Fixture Wallet", { exact: true }).click();
  await page.getByLabel("Journal passphrase").fill("invoice navigation test password");
  await page.getByRole("button", { name: "Create journal" }).click();
  await expect(page.getByLabel("Public FT payment plan")).toBeEnabled();
  await page.getByLabel("Public FT payment plan").setInputFiles({ name: "first-plan.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(await plan(first.signed, "42"))) });
  await expect(page.getByRole("button", { name: "Approve payment in wallet" })).toBeEnabled();
  // A marker proves this is a same-document navigation, not a fresh page load.
  await page.evaluate(() => { (window as any).invoiceNavigationMarker = true; });
  await page.goto(secondLink);
  expect(await page.evaluate(() => (window as any).invoiceNavigationMarker)).toBe(true);
  await expect(page.getByRole("heading", { name: "Second invoice", exact: true })).toBeVisible();
  await expect(page.getByText("second-recipient.testnet", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Core API origin")).toHaveValue("http://localhost:3001");
  await expect(page.getByRole("button", { name: "Connect testnet wallet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your journal is unlocked" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Approve payment in wallet" })).toHaveCount(0);
  await expect(page.getByLabel("Public FT payment plan")).toBeDisabled();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Design milestone", exact: true })).toBeVisible();
  await expect(page.getByLabel("Public FT payment plan")).toBeDisabled();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Second invoice", exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = "invoice=invalid"; });
  await expect(page.getByRole("heading", { name: "Invoice could not be verified" })).toBeVisible();
  await expect(page.getByLabel("Public FT payment plan")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Second invoice", exact: true })).toBeVisible();
});

test("a late signature verification cannot replace a newer invoice", async ({ page }) => {
  await fixture(page);
  const first = await issue(page), second = await secondInvoice(page, first.signed);
  await page.goto("/pay/");
  await expect(page.getByRole("heading", { name: "Invoice could not be verified" })).toBeVisible();
  await page.evaluate(() => {
    const verify = crypto.subtle.verify.bind(crypto.subtle);
    let hold = true;
    crypto.subtle.verify = async (...args: Parameters<typeof verify>) => {
      const result = await verify(...args);
      if (hold) {
        hold = false;
        await new Promise<void>(resolve => { (window as any).releaseInvoiceVerification = resolve; });
      }
      return result;
    };
  });
  await page.evaluate(hash => { location.hash = hash; }, new URL(first.link).hash);
  await page.waitForFunction(() => typeof (window as any).releaseInvoiceVerification === "function");
  await page.evaluate(hash => { location.hash = hash; }, new URL(invoiceLink(new URL(first.link).origin, second)).hash);
  await expect(page.getByRole("heading", { name: "Second invoice", exact: true })).toBeVisible();
  await page.evaluate(() => (window as any).releaseInvoiceVerification());
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.getByRole("heading", { name: "Design milestone", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Second invoice", exact: true })).toBeVisible();
});
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
