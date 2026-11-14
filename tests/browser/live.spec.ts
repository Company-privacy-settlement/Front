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
const vault = `v${"a".repeat(32)}.${policy.registry}`,
  payer = "alice.testnet",
  hash = "1".repeat(44),
  password = "browser journal test passphrase";
const payment = {
  contract: policy.tokenId,
  method: "ft_transfer_call",
  args: {
    receiver_id: vault,
    amount: "1001500",
    msg: JSON.stringify({ commitment: "42", disclosure_root: "ab".repeat(32) }),
  },
  attachedYoctoNear: "1",
  gas: "300000000000000",
};
async function injectedWallet(page: Page, loseResponse = false) {
  await page.route(
    "https://raw.githubusercontent.com/hot-dao/**/manifest.json",
    (r) => r.fulfill({ json: { wallets: [], version: "1.0.0" } }),
  );
  await page.addInitScript(
    ({ payer, hash, loseResponse }) => {
      const w = window as unknown as { fixtureCalls: unknown[] };
      w.fixtureCalls = [];
      const wallet = {
        manifest: {
          id: "fixture-wallet",
          name: "Fixture Wallet",
          type: "injected",
          platform: ["web"],
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
          description: "Injected test provider",
          website: "https://example.com",
          version: "1",
          executor: "",
          permissions: {},
          features: {
            testnet: true,
            mainnet: false,
            signAndSendTransaction: true,
            signInWithoutAddKey: true,
          },
        },
        signIn: async () => [{ accountId: payer }],
        signOut: async () => {},
        getAccounts: async () => [{ accountId: payer }],
        signAndSendTransaction: async (params: unknown) => {
          w.fixtureCalls.push(params);
          if (loseResponse)
            throw new Error("Fixture response lost after broadcast");
          return { transaction: { hash, signer_id: payer } };
        },
      };
      window.addEventListener("near-selector-ready", () =>
        window.dispatchEvent(
          new CustomEvent("near-wallet-injected", { detail: wallet }),
        ),
      );
    },
    { payer, hash, loseResponse },
  );
}
async function configure(page: Page) {
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
async function connect(page: Page) {
  await page.getByRole("button", { name: "Connect payment wallet" }).click();
  await page.getByText("Fixture Wallet", { exact: true }).click();
  await expect(page.locator(".live-wallet").getByText(payer, { exact: true })).toBeVisible();
}
async function importPlan(page: Page) {
  await expect(page.getByLabel("Public FT payment plan")).toBeEnabled();
  await page
    .getByLabel("Public FT payment plan")
    .setInputFiles({
      name: "plan.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ tokenCall: payment })),
    });
}
const journalKey = 'core-live-journal-v1:testnet:forest.testnet';
async function readyWorkspace(page: Page, beforePreflight?: () => Promise<void>) {
  await injectedWallet(page);
  await page.route('https://core-api.example/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/v1/ft/preflight') await beforePreflight?.();
    const json = path === '/v1/config' ? { policy } : path === '/v1/ft/preflight'
      ? { canPrepare: true, prerequisitesSatisfied: true, prerequisites: [], blockers: [], tokenAmountRequired: '1001500', payerTokenBalance: '2000000', checkedAtBlock: { hash, height: 100 } }
      : { state: 'NotFound', complete: false, refunded: false, retryAvailable: false, refundAvailable: false, retryCall: null, refundCall: null, record: null, checkedAtBlock: { hash, height: 100 } };
    await route.fulfill({ json, headers: { 'access-control-allow-origin': '*' } }).catch(() => {});
  });
  await page.goto('/live/'); await configure(page); await connect(page);
}
async function createJournal(page: Page) {
  await page.getByLabel('Journal passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create journal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lock', exact: true })).toBeVisible();
}
test('journal cache lock clears operation views and preserves encrypted history for explicit unlock', async ({ page }) => {
  await readyWorkspace(page); await createJournal(page); await importPlan(page);
  await expect(page.getByRole('button', { name: 'Approve payment in wallet' })).toBeEnabled();
  const encrypted = await page.evaluate(key => localStorage.getItem(key), journalKey);
  const visible = await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    return document.querySelectorAll('.live-history>button').length;
  });
  expect(visible).toBe(0); expect(await page.evaluate(key => localStorage.getItem(key), journalKey)).toBe(encrypted);
  await expect(page.getByRole('button', { name: 'Lock', exact: true })).toHaveCount(0);
  await page.getByLabel('Journal passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Unlock existing', exact: true }).click();
  await expect(page.locator('.live-history>button')).toHaveCount(1);
  expect(await page.evaluate(() => (window as any).fixtureCalls.length)).toBe(0);
});
test('journal cache lock cancels an unfinished create before it can unlock or write storage', async ({ page }) => {
  await readyWorkspace(page);
  await page.evaluate(() => {
    const encrypt = crypto.subtle.encrypt.bind(crypto.subtle);
    crypto.subtle.encrypt = async (...args: Parameters<SubtleCrypto['encrypt']>) => {
      (window as any).journalEncryptionStarted = true;
      await new Promise<void>(resolve => { (window as any).finishJournalEncryption = resolve; });
      const result = await encrypt(...args); (window as any).journalEncryptionFinished = true; return result;
    };
  });
  await page.getByLabel('Journal passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create journal', exact: true }).click();
  await page.waitForFunction(() => (window as any).journalEncryptionStarted);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await page.evaluate(() => (window as any).finishJournalEncryption());
  await page.waitForFunction(() => (window as any).journalEncryptionFinished);
  await expect(page.getByRole('button', { name: 'Lock', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Journal passphrase', { exact: true })).toHaveValue('');
  expect(await page.evaluate(key => localStorage.getItem(key), journalKey)).toBeNull();
});
test('journal cache lock during approval preflight prevents a late wallet request', async ({ page }) => {
  let pause = false, entered!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  await readyWorkspace(page, async () => { if (pause) { entered(); await gate; } });
  await createJournal(page); await importPlan(page);
  await expect(page.getByRole('button', { name: 'Approve payment in wallet' })).toBeEnabled(); pause = true;
  await page.getByRole('button', { name: 'Approve payment in wallet' }).click(); await started;
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))); release();
  await expect(page.locator('.live-history>button')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Approve payment in wallet' })).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).fixtureCalls.length)).toBe(0);
  pause = false;
  await page.getByLabel('Journal passphrase', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Unlock existing', exact: true }).click();
  await expect(page.locator('.live-history>button')).toHaveCount(1);
  expect(await page.evaluate(() => (window as any).fixtureCalls.length)).toBe(0);
});
test("testnet workspace reviews storage and token calls, confirms contract state and exports encrypted history", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await injectedWallet(page);
  let credit = false,
    accepted = false,
    complete = false;
  await page.route("https://core-api.example/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const request = route.request().postDataJSON();
    let json: unknown;
    if (path === "/v1/config") json = { policy };
    else if (path === "/v1/settlements/status")
      json = {
        state: complete ? "Active" : "NotFound",
        complete,
        refunded: false,
        retryAvailable: false,
        refundAvailable: false,
        retryCall: null,
        refundCall: null,
        record: complete ? { owner: payer, state: "Active" } : null,
        checkedAtBlock: { hash: "final-block", height: 100 },
      };
    else if (path === "/v1/ft/preflight")
      json = {
        canPrepare: true,
        prerequisitesSatisfied: credit,
        prerequisites: credit
          ? []
          : [
              {
                contract: vault,
                method: "prepay_storage",
                args: { account_id: payer },
                attachedYoctoNear: "25000000000000000000000",
                gas: payment.gas,
              },
            ],
        blockers: [],
        tokenAmountRequired: "1001500",
        payerTokenBalance: "2000000",
        checkedAtBlock: { hash: "final-block", height: 100 },
      };
    else if (path === "/v1/transactions/verify") {
      if (request.call.method === "prepay_storage") credit = true;
      else accepted = true;
      json = {
        status: "final",
        effect: "accepted",
        transaction: request.transaction,
      };
    }
    await route.fulfill({
      json,
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await page.goto("/live/");
  await configure(page);
  await connect(page);
  await page.getByLabel("Journal passphrase").fill(password);
  await page.getByRole("button", { name: "Create journal" }).click();
  await expect(
    page.getByText("Your journal is unlocked", { exact: true }),
  ).toBeVisible();
  await importPlan(page);
  await expect(
    page.getByRole("button", { name: "Approve prerequisite in wallet" }),
  ).toBeVisible();
  await expect(page.locator(".live-review")).toContainText("0.025");
  await page
    .getByRole("button", { name: "Approve prerequisite in wallet" })
    .click();
  await expect(
    page.getByRole("button", { name: "Approve payment in wallet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve payment in wallet" }).click();
  await expect.poll(() => accepted).toBe(true);
  complete = true;
  await page.getByRole("button", { name: "Refresh finalized state" }).click();
  await expect(page.locator(".live-review")).toContainText(
    "Confirmed by finalized contract state",
  );
  const calls = await page.evaluate(
    () =>
      (
        window as unknown as {
          fixtureCalls: {
            signerId: string;
            network: string;
            actions: { type: string; params: { methodName: string } }[];
          }[];
        }
      ).fixtureCalls,
  );
  expect(calls).toHaveLength(2);
  expect(calls.map((c) => c.actions[0].params.methodName)).toEqual([
    "prepay_storage",
    "ft_transfer_call",
  ]);
  expect(
    calls.every((c) => c.signerId === payer && c.network === "testnet"),
  ).toBe(true);
  const stored = await page.evaluate(
    () =>
      Object.entries(localStorage).find(([key]) =>
        key.startsWith("core-live-journal-v1:"),
      )?.[1],
  );
  expect(stored).toContain("core-operation-journal");
  expect(stored).not.toContain("commitment");
  expect(stored).not.toContain(payer);
  expect(stored).not.toContain(password);
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  expect((await file).suggestedFilename()).toBe(
    "core-operations.encrypted.json",
  );
  await expect(page.getByRole("button", { name: "Lock", exact: true })).toBeEnabled();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page.screenshot({
    path: info.outputPath("live-settlement.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("lost wallet response stays blocked after reload and cannot produce another signature", async ({
  page,
}) => {
  await injectedWallet(page, true);
  await page.route("https://core-api.example/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json =
      path === "/v1/config"
        ? { policy }
        : path === "/v1/ft/preflight"
          ? {
              canPrepare: true,
              prerequisitesSatisfied: true,
              prerequisites: [],
              blockers: [],
              tokenAmountRequired: "1001500",
              payerTokenBalance: "2000000",
              checkedAtBlock: { hash: "final-block", height: 100 },
            }
          : {
              state: "NotFound",
              complete: false,
              refunded: false,
              retryAvailable: false,
              refundAvailable: false,
              retryCall: null,
              refundCall: null,
              record: null,
              checkedAtBlock: { hash: "final-block", height: 100 },
            };
    await route.fulfill({
      json,
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await page.goto("/live/");
  await configure(page);
  await connect(page);
  await page.getByLabel("Journal passphrase").fill(password);
  await page.getByRole("button", { name: "Create journal" }).click();
  await importPlan(page);
  await page.getByRole("button", { name: "Approve payment in wallet" }).click();
  await expect(page.locator(".live-feedback[role=alert]")).toContainText("response lost");
  await page.getByRole("button", { name: "Refresh finalized state" }).click();
  await expect(page.locator(".live-review")).toContainText(
    "Signature outcome is unknown",
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { fixtureCalls: unknown[] }).fixtureCalls.length,
    ),
  ).toBe(1);
  await page.reload();
  await configure(page);
  await page.getByLabel("Journal passphrase").fill(password);
  await page.getByRole("button", { name: "Unlock existing" }).click();
  await page.getByRole("button", { name: /Deposit.*open/ }).click();
  await expect(page.locator(".live-review")).toContainText(
    "Signature outcome is unknown",
  );
  await expect(
    page.getByRole("button", { name: "Approve payment in wallet" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { fixtureCalls: unknown[] }).fixtureCalls.length,
    ),
  ).toBe(0);
});
test('disconnecting the shared wallet locks a reviewed payment without signing or deleting its encrypted journal',async({page})=>{await readyWorkspace(page);await createJournal(page);await importPlan(page);await expect(page.getByRole('button',{name:'Approve payment in wallet'})).toBeEnabled();const encrypted=await page.evaluate(key=>localStorage.getItem(key),journalKey);await page.getByRole('button',{name:'Manage connected wallet'}).click();await page.getByRole('button',{name:'Disconnect wallet',exact:true}).click();await expect(page.locator('.live-wallet strong')).toHaveText('No wallet connected');await expect(page.getByRole('button',{name:'Lock',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Approve payment in wallet'})).toHaveCount(0);expect(await page.evaluate(key=>localStorage.getItem(key),journalKey)).toBe(encrypted);expect(await page.evaluate(()=>(window as any).fixtureCalls)).toEqual([]);});
