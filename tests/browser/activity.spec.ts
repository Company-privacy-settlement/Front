import { test, expect, type Page } from "@playwright/test";
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
const old = new Date(Date.now() - 15 * 60000).toISOString();
function status(n = 3) {
  return {
    enabled: true,
    policy,
    checkpoint: {
      block: { hash, height: 200 },
      nextIndex: n,
      sourceRecordCount: n,
      updatedAt: old,
    },
    indexedRecords: n,
    linkedRecords: 1,
    remainingRecords: 0,
    candidates: { linked: 1, pending: 1 },
    scope: "configured_registry_records",
    claims: { completeBusinessHistory: false, taxFilingAccepted: false },
    chainFreshnessChecked: false,
    discovery: {
      enabled: true,
      state: {
        startHeight: 100,
        lastComplete: { hash, height: 180 },
        current: { block: { hash, height: 181 }, offset: 2, total: 8 },
        scannedTransactions: 32,
        candidatesFound: 2,
        updatedAt: old,
        blocked: "TRANSACTION_NOT_FINAL",
      },
    },
  };
}
function item(
  index: number,
  kind: "deposit" | "withdrawal_requested" | "withdrawal_succeeded",
) {
  return {
    record: {
      index,
      kind,
      commitment: kind === "deposit" ? "42" : null,
      nullifier: kind === "deposit" ? null : "12",
      vault,
      recipient: kind === "deposit" ? null : "receiver.testnet",
      disclosure_root: "ab".repeat(32),
      block_height: 150,
      timestamp_ns: "1794509000000000000",
      amount: "1000000",
      asset_token_id: "usdc.testnet",
      protocol_fee_charged: kind === "withdrawal_succeeded" ? "0" : "1500",
      protocol_fee_earned: kind === "withdrawal_requested" ? "0" : "1500",
      storage_fee_charged:
        kind === "withdrawal_succeeded" ? "0" : "20000000000000000000000",
    },
    observedAt: { hash, height: 200 },
    provenance:
      kind === "withdrawal_succeeded"
        ? {
            transaction: { hash, signer: "alice.testnet" },
            outerOutcome: "failed",
            receipts: [{ id: hash, blockHash: hash }],
            verifiedAt: { hash, height: 200 },
          }
        : null,
  };
}
async function configure(page: Page) {
  await page.goto("/live/");
  await page.getByLabel("Payment service origin").fill("https://core-api.example");
  await page
    .getByLabel("Trusted policy JSON")
    .setInputFiles({
      name: "policy.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(policy)),
    });
  await page.getByRole("button", { name: "Verify API policy" }).click();
  await expect(
    page.getByRole("button", { name: "Policy matches" }),
  ).toBeVisible();
}
test("public indexed activity shows checkpoint age, incomplete discovery, unresolved provenance and stable filtered pages", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let appended = false;
  await page.route("https://core-api.example/**", async (route) => {
    const url = new URL(route.request().url());
    let json: unknown;
    if (url.pathname === "/v1/config") json = { policy };
    else if (url.pathname === "/v1/activity") {
      const filtered = url.searchParams.get("kind") === "withdrawal_succeeded",
        more = url.searchParams.has("cursor");
      if (more) appended = true;
      json = {
        items: filtered
          ? [item(2, "withdrawal_succeeded")]
          : more
            ? [item(0, "deposit")]
            : [
                item(2, "withdrawal_succeeded"),
                item(1, "withdrawal_requested"),
              ],
        nextCursor: filtered || more ? null : "page-two",
        snapshot: { upperExclusive: filtered && appended ? 4 : 3 },
        index: status(appended ? 4 : 3),
        scope: "configured_registry_records",
      };
    } else json = status();
    await route.fulfill({
      json,
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await configure(page);
  const panel = page.getByRole("region", { name: "A record you can inspect." });
  await expect(
    panel.getByText("Receipt linked", { exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByText("Provenance unresolved", { exact: true }),
  ).toBeVisible();
  await expect(panel).toContainText("Indexed 15 min ago");
  await expect(panel).toContainText("scanned through 180");
  await expect(panel).toContainText("Waiting: transaction not final");
  await expect(panel).toContainText("Outer transaction: failed");
  await panel.getByRole("button", { name: "Load more events" }).click();
  await expect(panel.locator(".indexed-event")).toHaveCount(3);
  await expect(
    panel.getByRole("button", { name: "Load more events" }),
  ).toHaveCount(0);
  await panel.getByLabel("Event type").selectOption("withdrawal_succeeded");
  await panel.getByRole("button", { name: "Apply filters" }).click();
  await expect(panel.locator(".indexed-event")).toHaveCount(1);
  await expect(
    panel.getByRole("link", { name: "View transaction" }),
  ).toHaveAttribute("href", `https://testnet.nearblocks.io/txns/${hash}`);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await panel.screenshot({ path: info.outputPath("indexed-activity.png") });
  expect(errors).toEqual([]);
});
test("disabled and tampered index responses show explicit errors without fabricated rows", async ({
  page,
}) => {
  let mode: "disabled" | "tampered" = "disabled";
  await page.route("https://core-api.example/**", async (route) => {
    if (new URL(route.request().url()).pathname === "/v1/config") {
      await route.fulfill({
        json: { policy },
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (mode === "disabled") {
      await route.fulfill({
        status: 503,
        json: { error: "INDEX_DISABLED" },
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    const row = item(0, "deposit");
    row.record.asset_token_id = "evil.testnet";
    await route.fulfill({
      json: {
        items: [row],
        nextCursor: null,
        snapshot: { upperExclusive: 3 },
        index: status(),
        scope: "configured_registry_records",
      },
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await configure(page);
  const panel = page.getByRole("region", { name: "A record you can inspect." });
  await expect(panel.getByRole("alert")).toContainText(
    "indexing is not enabled",
  );
  await expect(panel.locator(".indexed-event")).toHaveCount(0);
  mode = "tampered";
  await panel.getByRole("button", { name: "Refresh activity" }).click();
  await expect(panel.getByRole("alert")).toContainText(
    "asset or snapshot mismatch",
  );
  await expect(panel.locator(".indexed-event")).toHaveCount(0);
});
